/**
* @jsx React.DOM
*/

var React = require('react');
var util = require('util');
var start = new Date().getTime();
var events = require('./events');
var Settings = events.Settings;
var data = require('./data');

data.on('ready', loaded);

MAX_TRIALS_PER_DIAGRAM=20;

var typeSet = {
  ecog: ['array', 'float32']
};
var Electrode = React.createClass({
  render: function() {
    console.log("render electrod from", Settings.subsets());
    var trialGrids = Settings.subsets().map(function(s){
      return this.transferPropsTo(
        <TrialGrid key={s.label} label={s.label} num={this.props.num} trials={s.trials} />
      );
    }, this);
    var v = new Date().getTime();
    return <span className="electrode">
    <span className="number">Electrode {this.props.num+1}</span> 
    <br/>
    {trialGrids}
    </span>;
  }
});

var TrialGrid = React.createClass({
  componentDidMount: function(){
    var d = this.getDOMNode();
    this.needNewCanvas = true;
    this.componentDidUpdate();
    console.log("Mounted!");

    var self = this;
    //this.ivl = setInterval(function(){self.setState({"joshnew": 5});},1000);
  },
  componentWillUnmount: function(){
    console.log("unmounting");
    clearInterval(this.ivl);
  },
  componentWillReceiveProps: function(nextProps){
    this.needNewCanvas = true;
  },
  shouldComponentUpdate: function(next){
    if (this.props.num == next.num && this.props.label == next.label && this.props.settings.sort == next.settings.sort){
      return false;
    }
    return true;
  },
  componentDidUpdate: function(){
    if (this.needNewCanvas){
      this.needNewCanvas = false;
      window.c= c;
      var c = this.refs.canvas.getDOMNode();
      var $c = $(c);

      var gridWidth = 200.0;
      var gridHeightPerTrial = 10;

      var ctx = c.getContext("2d");
      var e = this.props.num;

      var nTrials = Math.min(MAX_TRIALS_PER_DIAGRAM, this.props.trials.length);
      var nSamples = 366;

      var colWidth = gridWidth / nSamples;
      var rowHeight = gridHeightPerTrial;

      c.height = nTrials * gridHeightPerTrial;
      c.width = gridWidth;
      ctx.fillStyle = "#444444";
      ctx.fillRect(0,0,c.width, c.height);
      window.c = c;

      setTimeout(function(){
        var vals = [];

        for (var trial=0; trial < nTrials;trial++){
          vals[trial] = tval = {
            trial: trial,
            opacities: []
          };

          for (var sample=0; sample < nSamples;sample++){
            var thisval = data.neurals[e][sample*data.config.TRIALS + this.props.trials[trial]];
            tval.opacities.push(thisval);
          }
        }

        if (this.props.settings.sort)
          vals = vals.sort(function(a,b){
            var atot=0, btot=0, ae=0, be=0;
            var len = a.opacities.length;
            for (var i=0;i<len;i++) {
              if (a.opacities[i] > 0) {
                atot += a.opacities[i];
                ae++;
              }
              if (b.opacities[i] > 0) {
                btot += b.opacities[i];
                be++;
              }
            }
            atot = atot*1.0/ae;
            btot = btot*1.0/be;
            if (atot > btot) return -1;
            if (atot == btot) return 0;
            return 1;
          });

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0,0,c.width, c.height);
          for (var v=0; v < nTrials;v++){
            var tv = vals[v];
            for (var sample=0; sample < nSamples;sample++){
              var opacity = 0;
              if (tv.opacities[sample] > 0)
                opacity = 1.0*((tv.opacities[sample] - 0)/10);
              var style = util.format("rgba(0, 0, 0, %d)", opacity);
              ctx.fillStyle = style;
              ctx.fillRect(sample*colWidth, v*rowHeight, colWidth, rowHeight);
            }
          }
      }.bind(this), 0);

    }
  },
  render: function() {
    var v = new Date().getTime();
    return <span className="electrode">
    <span className="number">{this.props.label}</span>
    <br/>
    <canvas className="traces" ref="canvas" />
    </span>;
  }
});

var PickerBox = React.createClass({
  handleChange: function(e){
    var val = e.target.checked;
    Settings.update({sort:val});
  },
  getInitialState: function() {
    return {settings: Settings._data};
  },
  electrodeToggled: function(eid){
    this.props.settings.electrodes[eid] = !this.props.settings.electrodes[eid];
    Settings.update();
  },
  vowelToggled: function(v){
    var vv = 'vowel.'+v;
    this.props.settings.categories[vv] = !this.props.settings.categories[vv];
    Settings.update();
  },
  render: function() {
    var elapsed = Math.round(this.props.elapsed  / 100);
    var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );
    var message =
    'React has been successfully running for ' + seconds + ' seconds.';
    console.log("state", this.state);

    var electrodeSelection = [];
    for (var i=0;i<data.config.LIMIT_NEURALS; i++){
     electrodeSelection.push(
    <div className="checkbox">
      <label>

     <input type="checkbox"
      checked={this.props.settings.electrodes[i]}
      onChange={this.electrodeToggled.bind(this, i)}/>
        {i+1}
      </label>
      </div>
      );
    }

    var vowelSelection = [];
    var vowels = Object.keys(data.categoryDetail.vowel).sort();
    for (var i=0;i<vowels.length; i++){
     vowelSelection.push(
    <div className="checkbox">
      <label>
        <input type="checkbox"  
               onChange={this.vowelToggled.bind(this, vowels[i])}
               checked={this.props.settings.categories['vowel.'+vowels[i]]} />
        {vowels[i]}
      </label>
      </div>);
    }


    return <div className="settings">
    <h4>Sort by activity&nbsp;
    
    <input type="checkbox"
      checked={this.props.settings.sort}
      onChange={this.handleChange}/>
    </h4>
    <br/>
    <h4>Vowel</h4>
    {vowelSelection}
    <br/>
    <h4>Electrodes</h4>
    {electrodeSelection}
    </div>;
  }
});

var App = React.createClass({
  componentDidMount: function(){
    Settings.on('change', function(newSettings){
      console.log('saw event', newSettings);
      this.setState({settings: newSettings});
    }.bind(this)); 
  },
  getInitialState: function() {
    return {settings: Settings.current()};
  },
  render: function() {
    var enums = this.state.settings.electrodes;
    var electrodes = [];
    for (var i=0;i<enums.length;i++) {
      if (enums[i]){
      electrodes.push(<Electrode
        key={i}
        num={i}
        settings={this.state.settings}/>)
      }
    }
    return (
      <div className="row">
        <div className="col-md-8">
          {electrodes}
        </div>
        <div className="col-md-4">
          <PickerBox
            elapsed={new Date().getTime() - start}
            onSearch={this.handleSearch} 
            settings={this.state.settings} />
         </div>
      </div>
    );
  }
});


var start = new Date().getTime();

function loaded(){
  console.log("Got all neurals", data.neurals, (new Date().getTime() - start));
  newLoaded();
}



var on = 0;
function newLoaded(){
  React.renderComponent(
    <App />,
    document.getElementById('container')
  );
}
