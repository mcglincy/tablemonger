const express = require("express")
const fs = require("fs");
const Handlebars = require("handlebars");
const numbering = require("./numbering.js");
const favicon = require("serve-favicon");

// page templates
const indexTemplate = Handlebars.compile(fs.readFileSync("views/index.hbs", "utf8"));
const legalTemplate = Handlebars.compile(fs.readFileSync("views/legal.hbs", "utf8"));

// set up our app
const app = express();
app.use(express.static("public"))
app.use(favicon(__dirname + "/../public/images/favicon.ico"));

var tables = JSON.parse(fs.readFileSync('data/tables.json', 'utf8'));

// force https on the production deploy
// https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
// https://webdva.github.io/how-to-force-express-https-tutorial/
/*
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
      if (req.headers.host === "tablemonger.herokuapp.com") {
        return res.redirect(301, "https://www.tablemonger.com");
      }
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect("https://" + req.headers.host + req.url);
      } else {
        return next();
      }
  } else {
    return next();
  }
});
*/

const getNumberedTableItems = async (tables, tableName) => {
  const table = tables.filter(t => t.name === tableName)[0];
  let tableItems = await cachedTableItems(table, tableName);
  const rows = table.rows;
  if (tableItems.length > rows) {
    tableItems = tableItems.slice(0, rows);
  }
  downloader.shuffleArray(tableItems);
  const numberedItems = numbering.numberedTableItems(tableItems);
  return numberedItems;
};

const getNumberedSubtableItems = async (tables, tableName) => {
  const table = tables.filter(t => t.name === tableName)[0];
  let tableItems = await cachedTableItems(table, tableName);
  const rows = table.rows;
  if (tableItems.length > rows) {
    tableItems = tableItems.slice(0, rows);
  }
  downloader.shuffleArray(tableItems);
  const numberedItems = numbering.numberedTableItems(tableItems);
  return numberedItems;
};

// App endpoints
app.get("/", async (req, res) => {
  const categories = tables.reduce((cats, table) => {
    // const cat = (cats[table.category] || []);
    const cat = (cats[table.roll] || []);
    cat.push(table);
    // cats[table.category] = cat;
    cats[table.roll] = cat;
    return cats;
  }, {});

  const templateData = {
    categories,
    something: false,
    user: req.user,
  };
  const indexHtml = indexTemplate(templateData);
  res.header("Content-Type", "text/html").send(indexHtml);
});

app.get("/api/tableitems", async (req, res) => {
  const tableName = req.query.name;
  const table = tables.filter(t => t.name === tableName)[0];

  // single table
  const tableItems = table.entries;
  res.json([tableItems]);
});

app.get("/healthz", (req, res) => {
  res.type("txt");
  res.send("ok");
});

app.get("/legal", async (req, res) => {
  const templateData = {};
  const html = legalTemplate(templateData);
  res.header("Content-Type", "text/html").send(html);  
});

// Serve!
app.listen(process.env.PORT || 8080, () => {});
