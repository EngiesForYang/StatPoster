const startSteps = [
  ['font',"150px Montserrat"],
    ['fillStyle','#ffffff'],
    ['fillText',["What Andrew Yang will do for", 200, 300]],
  ];


let props = {
  drawSteps:[...startSteps]
};

function exportPng() {
  console.log('exporting');
  var my_canvas = document.getElementById('canvas');
  var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
// window.open(
//   image,
//   '_blank'// <- This is what makes it open in a new window.
// );
  
window.location.href=image;
}

function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: " Mil" },
    { value: 1E9, symbol: " Bil" },
    { value: 1E12, symbol: " T" },
    { value: 1E15, symbol: " P" },
    { value: 1E18, symbol: " E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

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
//<button type="button" onclick="exportPng()">export to png</button>

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
      <input name='location' id='inputlocation' type='text' placeholder='enter zip or city'/>
      <input type='submit' value='go'/>
  </form>
<div style="display:flex;">


<canvas id="canvas" width="2550" height="3300" style="margin: 5px 5px; width: 500px;">
            This text is displayed if your browser does not support HTML5 Canvas.
        </canvas>
<div>
  ${renderStats(fullData)}
</div>
</div>
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
  img.crossOrigin="Anonymous";

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
  const investment = parseInt(stats['Population'].split(',').join(''))*1000;
  const invesDisplay = nFormatter(investment)
  const drawSteps = [
    ...startSteps,
    ['fillText',[fullData.geo, 400, 450]],
    ['font',"60px Montserrat"],
    ['fillText',[`Population ${stats['Population']} - Median Household Income - $${stats['Median Household Income']} - Poverty ${stats['Individuals below poverty level']}`,350,650]],  
    ['font',"130px Montserrat"],    
    ['fillText',[`Invest $${invesDisplay} into it EVERY MONTH`, 150, 1600]],
    ['font',"75px Montserrat"],    
    ['fillText',['The Freedom Dividend - $1000 a month for every adult',230,1790]],

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
