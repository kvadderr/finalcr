//Подключаем библиотеки
const express = require('express');
const cors = require("cors");
const open = require("open");
var nodemailer = require('nodemailer');
const { json } = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

//Подключение к БД
let db = new sqlite3.Database('db.sqlite');


//Создаем приложение на основе экспресс
const app = express();

//Приложение использует cors
app.use(cors());

//Чтобы читал 'application/json'
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//Читаем данные из выбранного файла JSON и отдаем клиенту
app.get('/course', function (request, response) {  
 
    let sql = "SELECT json_object('direction', direction.name,'course', json_group_array(json_object('id', course.id_course, 'name', course.name, 'detail', course.detail, 'price', course.price, 'timer', course.timer))) json_result FROM direction, course WHERE direction.id_direction = course.id_direction AND course.visible = '1' GROUP BY direction.name";

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
    
});


app.patch('/course', function(request, response){

    let data = request.body;
    let sql = "UPDATE course SET name = '"+data.name +"', price = '"+data.price +"', detail = '"+data.detail+"', timer  = '"+data.timer+ "', id_direction = '"+data.id_direction+"', visible = '"+data.visible +"'  WHERE id_course = " + data.id_course;
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
       response.send(rows);
        console.log(rows);
    });
})

//Читаем данные из выбранного файла JSON и отдаем клиенту
app.get('/courseName', function (request, response) {  
 
    let sql = "SELECT id_course, name from course WHERE id_user = " + request.query.id;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
    
});

app.get('/courseData', function (request, response) {  
 
    let sql = "SELECT * from course WHERE id_course = " + request.query.id;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
    
});


app.post('/result', function(request, response){
    let create_result = "INSERT INTO result (id_user, result, id_course, code) VALUES ('"+request.body.id_user+"', '" + request.body.result + "','"+ request.body.id_course + "','"+request.body.code+"')"; 
    console.log(create_result);
    db.run(create_result, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log("Результат добавлен!")
    });
});

app.post('/sendSupport', function(request, response) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kvadder.course@gmail.com',
          pass: 'coursepass123'
        }
      });
      var mailOptions = {
        from: 'kvadder.course@gmail.com',
        to: 'kvadder.course@gmail.com',
        subject: 'Запрос к тех.поддержке',
        text: 'сообщение - ' + request.body.text + ' Отправитель - ' + request.body.data
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

})

app.post('/finance', function(request, response){
    let create_result = "INSERT INTO finance (id_user, id_course, price) VALUES ('"+request.body.id_user+"','"+ request.body.id_course + "','"+request.body.price+"')"; 
    console.log(create_result);
    db.run(create_result, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log("Результат добавлен!")
    });
})

app.get('/finance', function(request, response) {
    let sql = "SELECT users.login, course.name, course.price FROM finance, users, course WHERE finance.id_user = users.id_user AND finance.id_course = course.id_course AND course.id_user = " + request.query.id;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.post('/course', function(request, response){
    
    let courseJson = JSON.parse(request.body.jsonData);
    console.log(courseJson);
    let id_course;
    let id_question;
    let create_question ='';
    let create_answer = [];
    let answer = {};

    let create_course = "INSERT INTO course(name, price, detail, timer, id_direction, id_user) VALUES ('" + request.body.name+"', '" + request.body.price+"', '" + request.body.detail+"','" + request.body.timer+"', '"+ request.body.id_direction+"', '"+ request.body.id_user+"')";
    db.run(create_course, function(err) {
        if (err) {
          return console.error(err.message);
        }
        id_course = this.lastID
        for (var i =0; i < courseJson.length; i++){
            create_question = create_question + "('" + courseJson[i].question + "', '" + id_course+ "'),";
            create_answer.push(courseJson[i].answers);
        }   
        create_question.substring();
        sql_create_question = "INSERT INTO question(title, id_course) VALUES " + create_question.slice(0, -1);
        create_answer.slice(0, -1)
        answer = {...answer, create_answer}
        console.log(create_answer[0][0]);
        db.run(sql_create_question, function(err) {
            if (err) {
                return console.error(err.message);
            }
            
            id_question = this.lastID;
            let string = '';
            for (var i =0; i < create_answer.length; i++){
                for (var j =0; j < create_answer[i].length; j++){
                    let id = 0;
                    if (j == 0) id = 1;
                    else id = 0;
                    
                    id_q = id_question + i - create_answer.length +1;
                    
                    console.log("ddd" + id_q)
                    string = string + "("+id_q +", '" + create_answer[i][j] + "', " + id + "),";
                }
            }

            
            
            sql_create_answer = "INSERT INTO answer (id_question, name, boolean) VALUES " + string.slice(0, -1);
            db.run(sql_create_answer, function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log("Вопрос добавлен")
            });
        });      

        

    });



   

    

})

//Читаем данные из выбранного файла JSON и отдаем клиенту
app.get('/test', function (request, response) {  
 
    let sql = "SELECT json_object('question', question.title,'answer', json_group_array(json_object('name', answer.name, 'detail', answer.boolean))) json_result FROM question, answer WHERE question.id_question = answer.id_question AND question.id_course = "+request.query.id+" GROUP BY question.title ORDER BY RANDOM()";
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
    
});


app.get('/users', function(request, response) {
    let sql = 'SELECT * FROM users WHERE login = "'+request.query.login+'" AND password = "'+request.query.pass+'"';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.post('/users', function(request, response) {
    let create_result = "INSERT INTO users (login, password, FIO, role, phone, mail) VALUES ('"+request.body.login+"','"+ request.body.password + "', '"+ request.body.FIO + "', "+ request.body.role + ", '"+ request.body.phone +"', '"+ request.body.mail + "')"; 
    console.log(create_result);
    db.run(create_result, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log("Пользователь добавлен!")
    });
})

app.get('/direction', function(request, response) {
    let sql = 'SELECT * FROM direction';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.get('/result', function(request, response) {
    let sql = "SELECT users.FIO, result.result, course.name, result.code FROM result, users, course WHERE users.id_user = result.id_user AND course.id_course = result.id_course AND result.id_user = " + request.query.id_user;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.get('/resultID', function(request, response) {
    let sql = "SELECT users.FIO AS FIO, result.result AS res, course.name AS courseName FROM result, users, course WHERE users.id_user = result.id_user AND course.id_course = result.id_course AND course.id_user = " + request.query.id;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})


app.get('/resultCode', function(request, response) {
    let sql = "SELECT users.FIO, result.result, course.name, result.code FROM result, users, course WHERE users.id_user = result.id_user AND course.id_course = result.id_course AND result.code = '" + request.query.code +"'";
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.get('/', function(req, res) {
    res.sendfile('index.html');
  });   

//Приложение слушает 4000 порт
app.listen(3000);
console.log("Сервер на порту 3000: Запущен");
