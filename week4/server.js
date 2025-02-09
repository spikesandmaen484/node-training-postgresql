require("dotenv").config();
const http = require("http");
const appDataSource = require("./db");

//判斷是否為 undefined
function isUndefined (value) {
  return value === undefined;
}

//檢驗字串
function isNotValidSting (value) {
  return typeof value !== "string" || value.trim().length === 0 || value === "";
}

//檢驗數字
function isNotValidInteger (value) {
  return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk
  });

  //課程方案
  //[GET] 取得購買方案列表
  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const packages = await appDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      });

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: packages
      }));
      res.end();
    } 
    catch (error) {
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }));
      res.end();
    }

  } 
  //[POST] 新增購買方案
  else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (isUndefined(data.name) || isNotValidSting(data.name) ||
                isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
                isUndefined(data.price) || isNotValidInteger(data.price)) {

          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }));
          res.end();
          return;
        }

        const creditPackageRepo = await appDataSource.getRepository("CreditPackage");
        const existPackage = await creditPackageRepo.find({
          where: {
            name: data.name
          }
        });
        if (existPackage.length > 0) {
          
          res.writeHead(409, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }));
          res.end();
          return;
        }

        const newPackage = await creditPackageRepo.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        });
        const result = await creditPackageRepo.save(newPackage);

        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: result
        }));
        res.end();
      } 
      catch (error) {
        //console.error(error);
        res.writeHead(500, headers);
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }));
        res.end();
      }
    });

  } 
  //[DELETE] 刪除購買方案
  else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      const packageId = req.url.split("/").pop();
      if (isUndefined(packageId) || isNotValidSting(packageId)) {
        
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      const result = await appDataSource.getRepository("CreditPackage").delete(packageId);
      if (result.affected === 0) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success"
      }));
      res.end();
    } 
    catch (error) {
      //console.error(error);
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }));
      res.end();
    }

  } 
  //教練專長
  //[GET] 取得教練專長列表
  else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      const skills = await appDataSource.getRepository("Skill").find({
        select: ["id", "name"]
      });

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: skills
      }));
      res.end();
    } 
    catch (error) {
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }));
      res.end();
    }

  } 
  //[POST] 新增教練專長
  else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (isUndefined(data.name) || isNotValidSting(data.name)) {

          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }));
          res.end();
          return;
        }

        const skillRepo = await appDataSource.getRepository("Skill");
        const existSkill = await skillRepo.find({
          where: {
            name: data.name
          }
        });

        if (existSkill.length > 0) {
          
          res.writeHead(409, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }));
          res.end();
          return;
        }

        const newSkill = await skillRepo.create({
          name: data.name
        });
        const result = await skillRepo.save(newSkill);

        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: result
        }));
        res.end();
      } 
      catch (error) {
        //console.error(error);
        res.writeHead(500, headers);
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }));
        res.end();
      }
    });

  } 
  //[DELETE] 刪除教練專長
  else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
    try {
      const skillId = req.url.split("/").pop();
      if (isUndefined(skillId) || isNotValidSting(skillId)) {
        
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      const result = await appDataSource.getRepository("Skill").delete(skillId);
      if (result.affected === 0) {
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }));
        res.end();
        return;
      }

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success"
      }));
      res.end();
    } 
    catch (error) {
      //console.error(error);
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }));
      res.end();
    }

  } 
  else if (req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } 
  else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由",
    }));
    res.end();
  }
}

const server = http.createServer(requestListener);

async function startServer() {
  await appDataSource.initialize();
  console.log("資料庫連接成功");
  server.listen(process.env.PORT);
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`);
  return server;
}

module.exports = startServer();
