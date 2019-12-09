const cities = require("./cities.json");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM } = jsdom;

const ts = Date.now();
const logger = fs.createWriteStream(`${ts}-cityInfo.txt`, {
  flags: "a" // 'a' means appending (old data will be preserved)
});

const getCityData = cityData => {
  const { city, city_ascii, state_name } = cityData;

  fetch(
    `https://www.census.gov/quickfacts/search/json/?type=geo&search=${city_ascii}&_=${ts}`
  )
    .then(res => res.json())
    .then(res => {
      const results = res.data;
      const result = results.find(result =>
        result.label.toLowerCase().includes(state_name.toLowerCase())
      );
      return result;
    })
    .then(result => {
      if (result) {
        const url = `https://www.census.gov/quickfacts/fact/table/${result.id}/PST045218`;
        console.log(url);
        fetch(url)
          .then(res => res.text())
          .then(body => {
            const dom = new JSDOM(body);
            const document = dom.window.document;
            const table = Array.from(
              document.querySelectorAll('tr[data-url]:not([data-url=""])')
            );
            const tableNameNode = table[0].querySelector(
              'span[data-title]:not([data-title=""])'
            );
            const tableName =
              tableNameNode &&
              tableNameNode.dataset &&
              tableNameNode.dataset.title;
            console.log(tableName);
            if (tableName) {
              const data = table.reduce((data, row) => {
                const nameNode = row.querySelector("a");
                const name =
                  nameNode && nameNode.dataset
                    ? nameNode.dataset.title
                    : "noData";
                const valueNode = row.querySelector(
                  'td[data-value]:not([data-value=""])'
                );
                const value =
                  valueNode && valueNode.dataset
                    ? valueNode.dataset.value
                    : "nodata";
                data[name] = value;
                return data;
              }, {});
              console.log(data);
              logger.write(
                `(${result.id})||${tableName} : ${JSON.stringify(data)}` +
                  "\r\n"
              );
            } else {
              logger.write("/////////" + "\r\n");
            }
          })
          .catch(console.error);
      }
    });
};

const crawl = (times, refreshId) => {
  for (i = 0; i < times; i++) {
    const city = cities.pop();
    if (city) {
      getCityData(city);
    } else {
      clearInterval(refreshId);
      break;
    }
  }
};

const refreshId = setInterval(() => crawl(20, refreshId), 20000);

const chunkSize = 20;
const delay = 10;

const startCrawl = () => {
  for (i = 0; i < chunkSize; i++) {
    const city = cities.pop();
    if (city) {
      getCityData(city);
    } else {
      break;
    }
  }
  if (cities.length) {
    const waittime = (Math.floor(Math.random() * Math.floor(delay)) + 1) * 1000;
    console.log(`Waiting for ${waittime} miliseconds`);
    setTimeout(startCrawl);
  } else {
    console.log("done ------------------------");
  }
};

startCrawl();
