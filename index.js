import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "7864",
  port: 5433,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() { //so that the countries array can be accessed by both get and post routes.
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => { 
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs",{countries: countries, total: countries.length});
});

app.post("/add", async (req,res)=>{
  try{
   const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%'||$1||'%' ;",
    [req.body.country.toLowerCase()]
   );
  //  console.log(result);
   const countryCode = result.rows[0].country_code;
   console.log("country code=",countryCode);
  
   try{
     //if (countries.includes(`${countryCode}`)==false){  --> the array countries cannot be accessed here. 
     //visited_countries table cannot have duplicate records anyway.
     //if(countryCode){ --> no need because we are handling the error if the country has already been added.
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
        );
    //  }
     res.redirect("/")
   } catch(err){
     console.log(err);
     const countries = await checkVisited();
     res.render("index.ejs",{countries: countries, total: countries.length, error: "Country has already been added, try again."});
   }
  } catch(err){
    console.log(err);
    const countries = await checkVisited();
    res.render("index.ejs",{countries: countries, total: countries.length, error: "Country does not exist, try again."});
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
