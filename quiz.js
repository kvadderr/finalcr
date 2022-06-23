pagesElem = document.getElementById("pag");
headElem = document.getElementById("question");
buttonsElem = document.getElementById("buttons");   
HomeBTN = document.getElementById("homeBtn");
//Класс, который представляет сам тест
class Quiz
{
   constructor(type, questions, results)
   {
       //Тип теста: 1 - классический тест с правильными ответами, 2 - тест без правильных ответов
       this.type = type;
 
       //Массив с вопросами
       this.questions = questions;
 
       //Массив с возможными результатами
       this.results = results;
 
       //Количество набранных очков
       this.score = 0;
 
       //Номер результата из массива
       this.result = 0;
 
       //Номер текущего вопроса
       this.current = 0;
   }
 
   Click(index)
   {
       //Добавляем очки
       let value = this.questions[this.current].Click(index);
       this.score += value;
 
       let correct = -1;
 
       //Если было добавлено хотя бы одно очко, то считаем, что ответ верный
       if(value >= 1)
       {
           correct = index;
       }
       else
       {
           //Иначе ищем, какой ответ может быть правильным
           for(let i = 0; i < this.questions[this.current].answers.length; i++)
           {
               if(this.questions[this.current].answers[i].value >= 1)
               {
                   correct = i;
                   break;
               }
           }
       }
 
       this.Next();
 
       return correct;
   }
 
   //Переход к следующему вопросу
   Next()
   {
       this.current++;
      
       if(this.current >= this.questions.length)
       {
           this.End();
       }
   }
 
   //Если вопросы кончились, этот метод проверит, какой результат получил пользователь
   End()
   {
       for(let i = 0; i < this.results.length; i++)
       {
           if(this.results[i].Check(this.score))
           {
               this.result = i;
           }
       }
   }
}
 
//Класс, представляющий вопрос
class Question
{
   constructor(text, answers)
   {
       this.text = text;
       this.answers = answers;
   }
 
   Click(index)
   {
       return this.answers[index].value;
   }
}
 
//Класс, представляющий ответ
class Answer
{
   constructor(text, value)
   {
       this.text = text;
       this.value = value;
   }
}
 
//Класс, представляющий результат
class Result
{
   constructor(text, value)
   {
       this.text = text;
       this.value = value;
   }
 
   //Этот метод проверяет, достаточно ли очков набрал пользователь
   Check(value)
   {
       if(this.value <= value)
       {
           return true;
       }
       else
       {
           return false;
       }
   }
}



id = localStorage.getItem("id_course")
const url = new URL("http://95.213.224.23:3000/test/?id="+id);
let quiz        
json = []

fetch(url).then(function(response) {
    response.json().then(function(data) {
        var loadJson = data;
        var count = Object.keys(loadJson).length;
        
        for (var i =0; i<count; i++ ){
            json_result = loadJson[i].json_result;
            json.push(JSON.parse(json_result));
        }
        console.log(json);
        createQuestion(json);
    });
});



let questionq = [];

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function createAnswer(json){
    let answers = [];
    for (var i = 0; i< json.length; i++){
        answers.push(new Answer(json[i].name, json[i].detail));
    }
    shuffle(answers);
    return answers;
}
let result = 0; 
function createQuestion(json){
    for (var i =0; i < json.length; i++){       
        questionq.push(new Question(json[i].question, createAnswer(json[i].answer)));
    }
    result = json.length;
    console.log(questionq)
    quiz = new Quiz(1, questionq, results);
    Update();
}

//Массив с результатами
const results =
[
   new Result("Вам многому нужно научиться", result/5),
   new Result("Вы уже неплохо разбираетесь", result/4),
   new Result("Ваш уровень выше среднего", result/2),
   new Result("Вы в совершенстве знаете тему", result)
];



//Обновление теста
function Update()
{
    

   //Проверяем, есть ли ещё вопросы
   if(quiz.current < quiz.questions.length)
   {
       //Если есть, меняем вопрос в заголовке
       headElem.innerHTML = quiz.questions[quiz.current].text;
 
       //Удаляем старые варианты ответов
       buttonsElem.innerHTML = "";
 
       //Создаём кнопки для новых вариантов ответов
       for(let i = 0; i < quiz.questions[quiz.current].answers.length; i++)
       {
           let btn = document.createElement("button");
           btn.className = "button";
 
           btn.innerHTML = quiz.questions[quiz.current].answers[i].text;
 
           btn.setAttribute("index", i);
 
           buttonsElem.appendChild(btn);
       }
      
       //Выводим номер текущего вопроса
       pagesElem.innerHTML = (quiz.current + 1) + " / " + quiz.questions.length;
 
       //Вызываем функцию, которая прикрепит события к новым кнопкам
       Init();
   }
   else
   {
       let msg = '';
       final_result = quiz.score/result * 100
       final_result.toFixed(1)
       if (final_result > 75 ) {
           msg = 'Ваш диплом доступен в личном кабинете'
           let code = pass_gen(7);
           let id_user = localStorage.getItem("id_user");
           fetch ('http://95.213.224.23:3000/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {id_user: id_user,
                    result: final_result, 
                    id_course: id,
                    code: code})
            });
       }
       else msg = 'К сожалению, этого не достаточно для получения диплома. Попробуйте позже'
       //Если это конец, то выводим результат
       buttonsElem.innerHTML = "";
       headElem.innerHTML = "Вы набрали: " +  final_result.toFixed(1) + "% \n"+msg;
       pagesElem.innerHTML = "Очки: " + quiz.score;
       buttonsElem.innerHTML = HomeBTN.innerHTML;

   }
}

function gotoHome(){
    window.location.href = 'index.html';
}

function Init()
{
   //Находим все кнопки
   let btns = document.getElementsByClassName("button");
 
   for(let i = 0; i < btns.length; i++)
   {
       //Прикрепляем событие для каждой отдельной кнопки
       //При нажатии на кнопку будет вызываться функция Click()
       btns[i].addEventListener("click", function (e) { Click(e.target.getAttribute("index")); });
   }
}
 
function Click(index)
{
   //Получаем номер правильного ответа
   let correct = quiz.Click(index);
 
   //Находим все кнопки
   let btns = document.getElementsByClassName("button");
 
   //Делаем кнопки серыми
   for(let i = 0; i < btns.length; i++)
   {
       btns[i].className = "button button_passive";
   }
 
   //Если это тест с правильными ответами, то мы подсвечиваем правильный ответ зелёным, а неправильный - красным
   if(quiz.type == 1)
   {
       if(correct >= 0)
       {
           btns[correct].className = "button button_correct";
       }
 
       if(index != correct)
       {
           btns[index].className = "button button_wrong";
       }
   }
   else
   {
       //Иначе просто подсвечиваем зелёным ответ пользователя
       btns[index].className = "button button_correct";
   }
 
   //Ждём секунду и обновляем тест
   setTimeout(Update, 1000);
}

function pass_gen(len) {
    chrs = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789';
    var str = '';
    for (var i = 0; i < len; i++) {
        var pos = Math.floor(Math.random() * chrs.length);
        str += chrs.substring(pos,pos+1);
    }
    return str;
}