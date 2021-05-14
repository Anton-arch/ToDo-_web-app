(function() {
    // Создаём и возвращаем заголовок приложения
    function createAppTitle(title) {
      let appTitle = document.createElement('h2');
      appTitle.innerHTML = title;
      return appTitle;
    };

    // Создаём и возвращаем форму для создания дела
    function createTodoItemForm() {
      let form = document.createElement('form');
      let input = document.createElement('input');
      let buttonWrapper = document.createElement('div');
      let button = document.createElement('button');

      form.classList.add('input-group', 'mb-3');
      input.classList.add('form-control');
      input.placeholder = 'Введите название нового дела';
      buttonWrapper.classList.add('input-group-append');
      button.classList.add('btn', 'btn-primary');
      button.textContent = 'Добавить дело';

      buttonWrapper.append(button);
      form.append(input);
      form.append(buttonWrapper);

      return {
        form,
        input,
        button,
      };
    };

    // Создаём и возвращаем список элементов
    function createTodoList() {
      let list = document.createElement('ul');
      list.classList.add('list-group');
      return list;
    };

    function createTodoItem(name) {
      let item = document.createElement('li');
      // кнопки помещаем в элемент, который красиво покажет их в одной группе
      let buttonGroup = document.createElement('div');
      let doneButton = document.createElement('button');
      let deleteButton = document.createElement('button');

      // устанавливаем стили для элемента списка, а также для размещения кнопок
      // в его правой части с помощью flex
      item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      item.textContent = name;

      buttonGroup.classList.add('btn-group', 'btn-group-sm');
      doneButton.classList.add('btn', 'btn-success');
      doneButton.textContent = 'Готово';
      deleteButton.classList.add('btn', 'btn-danger');
      deleteButton.textContent = 'Удалить';

      // Вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
      buttonGroup.append(doneButton);
      buttonGroup.append(deleteButton);
      item.append(buttonGroup);

      // Приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
      return {
        item,
        doneButton,
        deleteButton,
      }
    }

    function createTodoApp(container, title = 'Список дел', arr = [], key) {
      let todoAppTitle = createAppTitle(title);
      let todoItemForm = createTodoItemForm();
      let todoList = createTodoList();

      container.append(todoAppTitle);
      container.append(todoItemForm.form);
      container.append(todoList);

      localStorage.setItem('arr', JSON.stringify(arr));

      JSON.parse(localStorage.getItem('arr')).forEach(item => {
        let newItem = createTodoItem(item.name, item.done);
        if(item.done) {
          newItem.item.classList.toggle('list-group-item-success');
        }
        todoList.append(newItem.item);
        // Добавляем обработчики на кнопки
        newItem.doneButton.addEventListener('click', function() {
          newItem.item.classList.toggle('list-group-item-success');
        });
        newItem.deleteButton.addEventListener('click', function() {
          if(confirm('Вы уверены?')) {
            newItem.item.remove();
          }
        });
      });

      todoItemForm.button.setAttribute('disabled', true);

      // будущий массив задач который будет храниться в localStorage
      let taskArray;
      // Счётчик для нахождения конкретного объекта в массиве по полю id
      let count;
      // массив айдишников у дел для того чтобы у каждого дела был уникальный id и не было каких-то проблем
      let countArr;

      // Проверяем после создания всех элементов на странице и после события submit на форме есть ли что-то в localStorage
      // если нет, значит присваиваем taskArray пустой массив, в противном случае достаём то что есть в localStorage, парсим
      // и присваиваем taskArray(должен быть распарсеный массив содержащий объекты)
      if(!localStorage.getItem(key)) {
        taskArray = [];
        countArr = [];
        count = 0;
      } else {
        // если в localStorage под эти ключём не пусто значит присваиваем taskArray распарсеный массив из localStorage
        // также вытягиевае последнее значение count для объекта
        taskArray = JSON.parse(localStorage.getItem(key));
        // массив айдишников у дел для того чтобы у каждого дела был уникальный id и не было каких-то проблем
        countArr = taskArray.map(item => item.id);
        // само число и оно всегда отличное не задваивается не привязываюсь к длинне массива
        count = (localStorage.getItem(key) === '[]') ? 0 : Math.max(...countArr);

        // в данном случае поскольку теперь в taskArray распарсеный массив из localStorage тогда бежим по нему циклом
        // создаём элементы на странице и проверяем done
        taskArray.forEach(obj => {
          //создаём элементы
          let todoItem = createTodoItem(obj.task, obj.done);

          // проверяем если поле done === true значит красим в зелёный
          if(obj.done) {
            todoItem.item.classList.add('list-group-item-success');
          }

          // Добавляем обработчики на кнопки
          //готово/не готово
          todoItem.doneButton.addEventListener('click', function() {
            todoItem.item.classList.toggle('list-group-item-success');

            // Проверяем есть ли у элемента todoItem.item класс list-group-item-success
            // и если есть значит меняем поле done с false на true
            if(todoItem.item.classList.contains('list-group-item-success')) {
              obj.done = true;
            } else {
              obj.done = false;
            }

            let index = taskArray.indexOf(obj);

            taskArray.splice(index, 1, obj);
            localStorage.setItem(key, JSON.stringify(taskArray));

          });

          //удалить
          todoItem.deleteButton.addEventListener('click', function() {
            let index = taskArray.indexOf(obj);

            if(confirm('Вы уверены?')) {
              todoItem.item.remove();

              // бежим по массиву и находим соответствующий объект и меняем его на объект с done : true
              taskArray.splice(index, 1)
              localStorage.setItem(key, JSON.stringify(taskArray))

            }
          });

          // закидываем элементы в список
          todoList.append(todoItem.item);
        })
      }

      // Запихиваем массив в localStorage только при создании страницы
      localStorage.setItem(key, JSON.stringify(taskArray))

      todoItemForm.input.addEventListener('input', function() {
        if(!todoItemForm.input.value) {
          todoItemForm.button.setAttribute('disabled', true);
        } else {
          todoItemForm.button.removeAttribute('disabled', true);
          // Браузер создаёт событие submit на форме по нажатию на Enter или на кнопку по созданию дела
          todoItemForm.form.addEventListener('submit', function(e) {
            //отменяем стандартное поведение
            e.preventDefault();

            if(!todoItemForm.input.value) {
              return;
            }

            // Формируем представление элемента на странице в виде объекта
            let newData = {
              id: ++count,
              task: todoItemForm.input.value,
              done: false,
            }
            // и запихиваем его в массив taskArray
            taskArray.push(newData);

            // Перезаписываем значение массива в localStorage
            localStorage.setItem(key, JSON.stringify(taskArray));

            let todoItem = createTodoItem(todoItemForm.input.value);

            // Добавляем обработчики на кнопки
            todoItem.doneButton.addEventListener('click', function() {
              todoItem.item.classList.toggle('list-group-item-success');

              // Проверяем есть ли у элемента todoItem.item класс list-group-item-success
              // и если есть значит меняем поле done с false на true
              if(todoItem.item.classList.contains('list-group-item-success')) {
                newData.done = true;
              } else {
                newData.done = false;
              }

              let index = taskArray.indexOf(newData);

              taskArray.splice(index, 1, newData);
              localStorage.setItem(key, JSON.stringify(taskArray));

            });
            todoItem.deleteButton.addEventListener('click', function() {
              if(confirm('Вы уверены?')) {
                let index = taskArray.indexOf(newData);

                todoItem.item.remove();

                taskArray.splice(index, 1)
                localStorage.setItem(key, JSON.stringify(taskArray))

              }
            });

            // Создаём и добавляем в список новое дело с названием из поля для ввода
            todoList.append(todoItem.item);

            // Обнуляем значение в поле, чтобы не пришлось стирать его вручную
            todoItemForm.input.value = '';
            todoItemForm.button.setAttribute('disabled', true);
          })
        }
      })
    }

    window.createTodoApp = createTodoApp;
})();
