let props = {
  drawSteps: [
        ['font',"150px Roboto"],
    ['fillStyle','#ffffff'],
    ['fillText',["What Andrew Yang will do for", 200, 300]],
  ]
};



function renderStats(fullData) {
  if (fullData) {
    const {
      stats,
      geo,
      geoType
    } = fullData;
    return (
      `
        <h2>${geo}</h3>
        <div>Area type: ${geoType}</div>
        ${Object.keys(stats).map(lable=>`<div>${lable}: ${stats[lable]}</div>`).join('')}
       `
    );
  } else {
    return '';
  }

}

function renderHtml(newProps) {

  const {
    fullData,
    drawSteps
  } = newProps;
  props = newProps;

  document.getElementById("app").innerHTML = `
<h1>Hello Yang!</h1>
<div>
  <form onsubmit='return getStats(event);'>
      <input name='location' id='inputlocation' type='text'/>
      <input type='submit' />
  </form>
  ${renderStats(fullData)}

<canvas id="canvas" width="2550" height="3300" style="margin: 20px 5px; width: 500px;">
            This text is displayed if your browser does not support HTML5 Canvas.
        </canvas>
</div>
`;
  
  var my_canvas = document.getElementById('canvas'),
    context = my_canvas.getContext("2d");
  var img = new Image();
img.onload = function () {
    context.drawImage(img, 0, 0);
  console.log(drawSteps)
  drawSteps.forEach(([step,args])=>{
    console.log({step,args});
    if (Array.isArray(args)){
      context[step](...args);
    }
    else {
      context[step] = args;
    }
  })
}
img.src = "https://engiesforyang.github.io/StatPoster/EverySingleMonthTemplate.png";

}

async function getincomefromzip(zip) {
  const data = await fetch(`https://factfinder.census.gov/rest/communityFactsNav/nav?N=0&_t=${Date.now()}&log=t&spotlightId=ALL&searchTerm=${zip}`);
  const json = await data.json()
  //console.log(json);
  return json;
};

async function loadData(term) {
  const data = await getincomefromzip(term);
  console.log(data)
  const fullData = data.CFMetaData;
  const stats = fullData.measuresAndLinks.allMeasures.reduce((o, c) => {
    const getValue = (list) => {
      if (list && list.length) {
        const val = list.reduce((o, c) => {
          if (c.value && o.length < 1) {
            o = c.value;
          }
          return o;
        }, '')
        return val;
      }
    }
    o[c.label] = c.value ? c.value : getValue(c.list)
    return o;
  }, {})
  fullData.stats = stats;
  const drawSteps = [
    ...props.drawSteps,
    ['fillText',[fullData.geo, 400, 450]],
    ['font',"60px Roboto"],
    ['fillText',[`Population ${stats['Population']} - Median Household Income - $${stats['Median Household Income']} - Poverty ${stats['Individuals below poverty level']}`,350,650]]

  ];
  console.log({
    stats
  })
  renderHtml({
    ...props,
    fullData,
    drawSteps
  })

}


function getStats(e) {
  e.preventDefault();
  try {
    const location = document.querySelector('#inputlocation')
    const searchTerm = location.value;
    loadData(searchTerm)
  } catch (e) {
    console.error(e);
  }
  return false;
}

renderHtml(props);
