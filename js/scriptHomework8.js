// 1. Напишите функцию all (аналог стандартной Promise.all), которая принимает на вход массива promise'ов и вовращает promise, который переходит 
// в состояние resolved только тогда, когда все promis'ы из массива переходят в состояние resolved, а в функию then попадает массив, в котором 
// каждый элемент - результат работы каждого promis'а из массива в том же порядке. 
// Если хоть один из promis'ов переходит в состояние rejected, результирующий promise тоже станивится rejected с той же ошибкой
// Нужно завести счётчик количества resolved promisов и массив из arr.length элементов, вначале все элементы undefined. Затем для каждого promise в массиве 
// добавить then. В первой функции, которая сработает на успех, занести результат в массив в тот же индекс, что у промиса и увеличить счётчик на единицу. 
// Если счётчик равен arr.length, вызвать resolve с передачей в него массива результатов. Второй функцией каждого then сделать reject

var arr = [];
var countPromiseResolved = 0;

function all(arrPromise) {  
    const promise = new Promise(function (resolve, reject) {
        countPromiseResolved++;
        for(let i = 0; i < arrPromise.length; i++) {
            
            arrPromise[i].then(function (arrPromiseResponce) {
                arr.push(arrPromiseResponce);
                
                if(countPromiseResolved === arr.length) {
                    resolve(arr);
                }
            }, function (error) {
                reject(error);
            })  
        }
    })
    return promise;
}
 //Примеры
 
all([
    fetch('http://jsonplaceholder.typicode.com/users').then(function (response) { return response.json(); }), 
    fetch('https://jsonplaceholder.typicode.com/comments').then(function (response) { return response.json(); })
    ]).then(function (array) { 
    console.log(array[0]); // воводит пользователей
    console.log(array[1]); // выводит комментарии
    });

    all([

        fetch('http://jsonplaceholr.typicode.com/user').then(function (response) { return response.json(); }), 
        // такого url'а не существует
        fetch('https://jsonplaceholder.typicode.com/comments')
        .then(function (response) { return response.json(); })
        ]).catch(function (error) {
        console.log(error); // выводит TypeError: Failed to fetch
        });

//2. Напишите функцию race (аналог стандартной Promise.race), которая принимает на вход массив promise'ов и возвращает promise, результат работы которого 
//- самый быстрый из результатов работы promis'ов массива.
// Массив не нужен. Можно в then всех промисов передать resolve, самый быстрый его вызовет, остальные тоже, но это уже результата не поменяет, т.к. состояние 
// промиса поменять нельзя

// function race(arrPromises) {  
        
//         const promise2 = new Promise(function (resolve, reject) {
            
//             for(let i = 0; i < arrPromises.length; i++) {
//                 arrPromises[i].then(function (arrPromiseResponce) {
//                     if(arrPromiseResponce) {
//                     resolve(arrPromiseResponce);
//                     }
//                 }, function (error) {
//                     reject(error);
//                 })  
//             }
//         })
//         return promise2;
//     }

    
function race(arrPromises) {  
    var arr = [];
    const promise2 = new Promise(function (resolve, reject) {
        
        for(let i = 0; i < arrPromises.length; i++) {
            arrPromises[i].then(function (arrPromiseResponce) {
                if(arrPromiseResponce) {
                arr.push(arrPromiseResponce);
                resolve(arr[0]);
                }
            }, function (error) {
                reject(error);
            })  
        }
    })
    return promise2;
}

race([
    fetch('https://jsonplaceholder.typicode.com/comments').then(function (response) { return response.json(); })
    , 
    fetch('http://jsonplaceholder.typicode.com/users').then(function (response) { return response.json(); }) // если ответ на этот запрос пришел быстрее, чем на запрос о комментариях
    ]).then(function (result) {
    console.log(result); // выведет массив пользователей
    }); 
    
    race([

        fetch('http://jsonplaceholr.typicode.com/user').then(function (response) { return response.json(); }), 
        // такого url'а не существует, ответ на этот запрос пришел быстрее
        fetch('https://jsonplaceholder.typicode.com/comments')
        .then(function (response) { return response.json(); })
        ]).catch(function (error) {
        console.log(error); // выводит TypeError: Failed to fetch
        });

        race([

            fetch('http://jsonplaceholr.typicode.com/user').then(function (response) { return response.json(); }), 
            // такого url'а не существует, ответ на этот запрос пришел медленнее
            fetch('https://jsonplaceholder.typicode.com/comments').then(function (response) { return response.json(); })
            // ответ на этот запрос пришел быстрее
            ]).then(function (result) {
            console.log(result); // выведет массив коментариев
            },
            function (error) { // эта функция не сработает, т.к. быстрее вернулся успешный ответ, а не ошибка
            console.log(error); 
            });


// 3. Написать функцию always, которая принимает на вход promise и возращает promise у которого значение - объект. В этом объекте два свойства data и error. 
// Если исходный promise стал resolved, то в ключе data должно быть его значение а error - undefined, а если стал rejected, то в error ошибка, а data - undefined.

function always(anyPromise) {  
    var obj = {};
    const promise3 = new Promise(function (resolve, reject) {
               anyPromise.then(function (response) {
                obj.data = response;
                obj.error = undefined;
                resolve(obj);
               }, function (err) {
                obj.error = err; 
                obj.data = undefined;
                reject(obj);
            })
        });
    return promise3;
}


always(fetch('http://jsonplaceholder.typicode.com/users').then(function (response) { return response.json(); }))
.then(function (obj) {
console.log(obj); // выведет {data: [...]} массив пользователей
})

always(fetch('http://jsonplaceholr.typicode.com/user').then(function (response) { return response.json(); }))
.then(function (obj) {
console.log(obj); // выведет {error: 'TypeError: Failed to fetch'}
})


// 4. Написать функцию withLoader(url), которая сначала добавляет в body сообщение о загрузке, потом делает fetch на url, переданный в аргументах, 
// затем, когда получен ответ, не важно, ошибка или нет, убирает загрузчик. Функция должна вернуть promise, который переходит в состояние resolved,
//  если данные пришли успешно и rejected, если произошла ошибка

function withLoader(url) {
    var pLoader = document.createElement('p');
    document.body.appendChild(pLoader);
    pLoader.textContent = 'Загрузка';
    pLoader.style.display = 'block';
    const promiseUrl = new Promise (function (resolve, reject) {
        fetch(url).then(function(urlResponse) {
            pLoader.style.display = 'none';
            const urlJson = urlResponse.json();
            resolve(urlJson);
        }, function (error) {
            pLoader.style.display = 'none';
            reject(error);
        })
    })
    return promiseUrl;
}

withLoader('http://jsonplaceholder.typicode.com/users').then(function (users) { console.log(users); }); // выводит массив пользователей
withLoader('http://jsonplaceholr.typicode.com/user').catch(function (error) { console.log(error); }); // выводит ошибку TypeError: Failed to fetch