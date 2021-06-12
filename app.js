const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     database: 'db_pplan',
});

db.connect();

app.get('/data', function (req, res) {
     var sql = 'SELECT * FROM water';
     db.query(sql, (err, result) => {
          if (err) throw err;
          console.log(result);
          res.send(result);
     });
});

app.post('/addPrice', function (req, res) {
     console.log(req.body);
     var data = {
          plan_ID: req.body.plan_ID,
          price_max: req.body.price_max,
          price_min: req.body.price_min,
          price_date: req.body.price_date,
     };
     var sql = 'INSERT INTO price SET ?';
     db.query(sql, data, (err, result) => {
          if (err) throw err;
          console.log(result);
          res.send({
               status: 'add price!',
               no: null,
               plan_ID: req.body.plan_ID,
               maxprice: req.body.maxprice,
               minprice: req.body.minprice,
               price_date: req.body.price_date,
          });
     });
});

app.post('/register', function (req, res) {
     var data = {
          user_ID: '',
          user_name: req.body.name,
          user_tel: req.body.tel,
          user_password: req.body.password,
          user_date: new Date()
               .toISOString()
               .replace(/T/, ' ')
               .replace(/\..+/, ''),
          user_role: 'A',
     };
     var sql = `SELECT user_tel FROM user WHERE user_tel='${data.user_tel}' `;
     db.query(sql, data, (err, result) => {
          if (err) throw err;
          if (result == '') {
               var sql = 'INSERT INTO user SET ?';
               db.query(sql, data, (err, result) => {
                    if (err) throw err;
                    res.send({
                         status: 'Success',
                         no: null,
                    });
               });
          } else {
               res.send({
                    status: 'Fail',
                    no: null,
               });
          }
     });
});

app.post('/signin', function (req, res) {
     var data = {
          tel: req.body.tel,
          password: req.body.password,
     };
     var sql = `SELECT user_name FROM user WHERE user_tel='${data.tel}' AND user_password='${data.password}' `;
     db.query(sql, data, (err, result) => {
          if (err) throw err;
          if (result == '') {
               res.send({
                    status: 'Fail',
                    result,
               });
          } else {
               res.send({ status: 'Success', result });
          }
     });
});

app.get(
     '/predict/:soil/:sunray/:climate/:water/:month/:harvest',
     function (req, res) {
          var sql = 'SELECT * FROM predict_plan';
          db.query(sql, (err, result) => {
               if (err) throw err;

               const predict = new Array(result.length);

               for (let index = 0; index < result.length; index++) {
                    predict[index] = new Array(2);
               }
               for (let index1 = 0; index1 < result.length; index1++) {
                    predict[index1][0] = result[index1].plan_ID;
                    for (let index2 = 1; index2 < 2; index2++) {
                         predict[index1][index2] = Math.sqrt(
                              Math.pow(
                                   req.params.soil - result[index1].soil,
                                   2,
                              ) +
                                   Math.pow(
                                        req.params.sunray -
                                             result[index1].sunray,
                                        2,
                                   ) +
                                   Math.pow(
                                        req.params.climate -
                                             result[index1].climate,
                                        2,
                                   ) +
                                   Math.pow(
                                        req.params.water - result[index1].water,
                                        2,
                                   ),
                         );
                    }
               }

               var ResPredict = predict.sort(function (a, b) {
                    return a[1] > b[1] ? 1 : -1;
               });
               var plant = [];
               var itemsFound = {};
               for (var i = 0, l = ResPredict.length; i < l; i++) {
                    var stringified = JSON.stringify(ResPredict[i][0]);
                    if (itemsFound[stringified]) {
                         continue;
                    }
                    plant.push(ResPredict[i]);
                    itemsFound[stringified] = true;
               }
               var plantPredict = [5];

               for (let index = 0; index < 5; index++) {
                    plantPredict[index] = plant[index][0];
               }
               JSON.stringify(plantPredict);
               res.send(plantPredict);
          });
     },
);

app.get('/getPlant/:name/:month/:harvest', function (req, res) {
     const plant = req.params.name.split(',');
     if (req.params.harvest === '1') {
          const sellMonth = parseInt(req.params.month) + 1;
          var sql =
               `SELECT plan.plan_name,  plan.plan_ID, AVG(price.price_max) AS price_max, AVG(price.price_min) AS price_min ` +
               `FROM plan INNER JOIN price ON plan.plan_ID=price.plan_ID ` +
               `WHERE (plan.plan_ID = "${plant[0]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=30 AND plan_time > 1 OR ` +
               `(plan.plan_ID = "${plant[1]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=30 AND plan_time > 1 OR ` +
               `(plan.plan_ID = "${plant[2]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=30 AND plan_time > 1 OR ` +
               `(plan.plan_ID = "${plant[3]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=30 AND plan_time > 1 OR ` +
               `(plan.plan_ID = "${plant[4]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=30 AND plan_time > 1 ` +
               `GROUP BY plan.plan_name ORDER BY AVG(price.price_max) DESC`;
     }
     if (req.params.harvest === '2') {
          const sellMonth = parseInt(req.params.month) + 2;
          var sql =
               `SELECT plan.plan_name, plan.plan_ID, AVG(price.price_max) AS price_max, AVG(price.price_min) AS price_min ` +
               `FROM plan INNER JOIN price ON plan.plan_ID=price.plan_ID ` +
               `WHERE (plan.plan_ID = "${plant[0]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=60 AND plan_time >= 31 OR ` +
               `(plan.plan_ID = "${plant[1]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=60 AND plan_time >= 31 OR ` +
               `(plan.plan_ID = "${plant[2]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=60 AND plan_time >= 31 OR ` +
               `(plan.plan_ID = "${plant[3]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=60 AND plan_time >= 31 OR ` +
               `(plan.plan_ID = "${plant[4]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=60 AND plan_time >= 31 ` +
               `GROUP BY plan.plan_name ORDER BY AVG(price.price_max) DESC`;
     }
     if (req.params.harvest === '3') {
          const sellMonth = parseInt(req.params.month) + 3;
          var sql =
               `SELECT plan.plan_name, plan.plan_ID, AVG(price.price_max) AS price_max, AVG(price.price_min) AS price_min ` +
               `FROM plan INNER JOIN price ON plan.plan_ID=price.plan_ID ` +
               `WHERE (plan.plan_ID = "${plant[0]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=90 AND plan_time >= 61 OR ` +
               `(plan.plan_ID = "${plant[1]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=90 AND plan_time >= 61 OR ` +
               `(plan.plan_ID = "${plant[2]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=90 AND plan_time >= 61 OR ` +
               `(plan.plan_ID = "${plant[3]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=90 AND plan_time >= 61 OR ` +
               `(plan.plan_ID = "${plant[4]}" AND MONTH(price.price_date) = "${sellMonth}"  AND price.price_date BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 5 year) AND CURRENT_DATE) AND plan_time <=90 AND plan_time >= 61 ` +
               `GROUP BY plan.plan_name ORDER BY AVG(price.price_max) DESC`;
     }
     db.query(sql, (err, result) => {
          if (err) throw err;
          if (null) throw null;
          res.send(result);
     });
});

app.get(
     '/calCostWithWork/:setPlant/:harvest/:rai/:ngan/:wa/:seed/:soil/:people/:day/:compost/:pesticides/:rent/:wage',
     function (req, res) {
          const plant = JSON.parse(req.params.setPlant);
          var rai = JSON.parse(req.params.rai);
          var compost = JSON.parse(req.params.compost);
          var pesticides = JSON.parse(req.params.pesticides);
          var rent = JSON.parse(req.params.rent);
          var people = JSON.parse(req.params.people);
          var day = JSON.parse(req.params.day);
          var wages = JSON.parse(req.params.wage);

          var sql = `SELECT plan_ID,plan_name,plan_product FROM plan WHERE plan_ID='${plant.plan_ID}'`;

          let cost = '';
          let soilCost = '';
          let seedCost = '';
          let workCost = '';
          let rentCost = '';
          let compostCost = '';
          let pesticidesCost = '';
          let product = '';
          let income1 = '';
          let income2 = '';
          let total1 = '';
          let total2 = '';
          var allBill = [];

          if (!rai) {
               rai = 0;
          }
          if (!compost) {
               compost = 0;
          }
          if (!pesticides) {
               pesticides = 0;
          }
          if (!rent) {
               rent = 0;
          }
          if (!people) {
               people = 0;
          }
          if (!day) {
               day = 0;
          }
          if (!wages) {
               wages = 336;
          }

          db.query(sql, (err, result) => {
               if (err) throw err;
               income1 =
                    plant.price_max *
                    (result[0].plan_product * rai +
                         (result[0].plan_product / 4) *
                              (JSON.parse(req.params.ngan) +
                                   (JSON.parse(req.params.wa) - 1) / 100));
               income2 =
                    plant.price_min *
                    (result[0].plan_product * rai +
                         (result[0].plan_product / 4) *
                              (JSON.parse(req.params.ngan) +
                                   (JSON.parse(req.params.wa) - 1) / 100));
               product =
                    result[0].plan_product * rai +
                    (result[0].plan_product / 4) *
                         (JSON.parse(req.params.ngan) +
                              (JSON.parse(req.params.wa) - 1) / 100);
               soilCost =
                    JSON.parse(req.params.soil) * rai +
                    (JSON.parse(req.params.soil) / 4) *
                         (JSON.parse(req.params.ngan) +
                              (JSON.parse(req.params.wa) - 1) / 100);
               seedCost =
                    JSON.parse(req.params.seed) * rai +
                    (JSON.parse(req.params.seed) / 4) *
                         (JSON.parse(req.params.ngan) +
                              (JSON.parse(req.params.wa) - 1) / 100);
               workCost = wages * people * day;
               rentCost =
                    (JSON.parse(req.params.harvest) + 1) *
                    ((rent / 12) * rai +
                         (rent / 12 / 4) *
                              (JSON.parse(req.params.ngan) +
                                   (JSON.parse(req.params.wa) - 1) / 100));
               compostCost =
                    JSON.parse(compost) * rai +
                    (JSON.parse(compost) / 4) *
                         (JSON.parse(req.params.ngan) +
                              (JSON.parse(req.params.wa) - 1) / 100);
               pesticidesCost =
                    pesticides * rai +
                    (pesticides / 4) *
                         (JSON.parse(req.params.ngan) +
                              (JSON.parse(req.params.wa) - 1) / 100);
               cost =
                    soilCost + seedCost + workCost + rentCost + pesticidesCost;
               total1 = income1 - cost;
               total2 = income2 - cost;

               allBill[0] = total1;
               allBill[1] = total2;
               allBill[2] = soilCost;
               allBill[3] = seedCost;
               allBill[4] = workCost;
               allBill[5] = rentCost;
               allBill[6] = compostCost;
               allBill[7] = cost;
               allBill[8] = plant.price_max;
               allBill[9] = plant.price_min;
               allBill[10] = product;
               allBill[11] = income1;
               allBill[12] = income2;
               allBill[13] = pesticidesCost;

               res.send(allBill);
          });
     },
);

app.get('/getPrice/:plant', function (req, res) {
     var sql =
          `SELECT EXTRACT(YEAR FROM price_date)AS price_date, AVG(price_max) AS price_max, AVG(price_min)AS price_min ` +
          `FROM price ` +
          `WHERE plan_ID = '${req.params.plant}' AND price_date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 5 year) AND CURRENT_DATE ` +
          `GROUP BY EXTRACT(YEAR FROM price_date)`;

     var dataX = [];
     var dataY = [];

     db.query(sql, (err, result) => {
          if (err) throw err;

          for (let index = 0; index < result.length; index++) {
               dataX[index] = result[index].price_date.toString();
          }
          for (let index = 0; index < result.length; index++) {
               dataY[index] = JSON.parse(
                    (
                         (result[index].price_max + result[index].price_min) /
                         2
                    ).toFixed(2),
               );
          }
          res.send({ dataX: dataX, dataY: dataY });
     });
});

app.get('/getPriceAll/:plant/:year/:month', function (req, res) {
     var sql =
          `SELECT DAY(price_date) as price_date, AVG(price_max) as price_max, AVG(price_min) as price_min ` +
          `FROM price ` +
          `WHERE plan_ID = '${req.params.plant}' AND YEAR(price_date) = '${req.params.year}' AND MONTH(price_date) = '${req.params.month}'  ` +
          `GROUP BY DAY(price_date)`;

     var dataX = [];
     var dataY = [];

     db.query(sql, (err, result) => {
          if (err) throw err;

          for (let index = 0; index < result.length; index++) {
               dataX[index] = result[index].price_date.toString();
          }
          for (let index = 0; index < result.length; index++) {
               dataY[index] = JSON.parse(
                    (
                         (result[index].price_max + result[index].price_min) /
                         2
                    ).toFixed(2),
               );
          }
          res.send({ dataX: dataX, dataY: dataY });
     });
});

app.get('/getPriceWithYear/:plant/:year', function (req, res) {
     var sql =
          `SELECT SUBSTRING(MONTHNAME(price_date),1,3) as price_date, AVG(price_max) as price_max, AVG(price_min) as price_min ` +
          `FROM price ` +
          `WHERE plan_ID = '${req.params.plant}' AND YEAR(price_date) = '${req.params.year}' ` +
          `GROUP BY MONTH(price_date)`;

     var dataX = [];
     var dataY = [];

     db.query(sql, (err, result) => {
          if (err) throw err;

          for (let index = 0; index < result.length; index++) {
               dataX[index] = result[index].price_date.toString();
          }
          for (let index = 0; index < result.length; index++) {
               dataY[index] = JSON.parse(
                    (
                         (result[index].price_max + result[index].price_min) /
                         2
                    ).toFixed(2),
               );
          }
          res.send({ dataX: dataX, dataY: dataY });
     });
});

app.get('/getPriceWithMonth/:plant/:month', function (req, res) {
     var sql =
          `SELECT YEAR(price_date) as price_date, AVG(price_max) as price_max, AVG(price_min) as price_min ` +
          `FROM price ` +
          `WHERE plan_ID = '${req.params.plant}' AND MONTH(price_date) = '${req.params.month}'  AND price_date BETWEEN DATE_SUB(CURRENT_DATE,INTERVAL 5 year) AND CURRENT_DATE ` +
          `GROUP BY YEAR(price_date)`;

     var dataX = [];
     var dataY = [];

     db.query(sql, (err, result) => {
          if (err) throw err;

          for (let index = 0; index < result.length; index++) {
               dataX[index] = result[index].price_date.toString();
          }
          for (let index = 0; index < result.length; index++) {
               dataY[index] = JSON.parse(
                    (
                         (result[index].price_max + result[index].price_min) /
                         2
                    ).toFixed(2),
               );
          }
          res.send({ dataX: dataX, dataY: dataY });
     });
});

app.listen(3032, () => {
     console.log('Server port 3032');
});
