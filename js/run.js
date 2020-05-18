const svg_tick = '<g fill-rule="evenodd"><path d="M12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8m0-17c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9"></path><path display="none" d="M10.9902 13.3027l-2.487-2.51-.71.704 3.193 3.224 5.221-5.221-.707-.707z"></path></g>';
const svg_tick_fill = '<path fill-rule="evenodd" d="M10.9854 15.0752l-3.546-3.58 1.066-1.056 2.486 2.509 4.509-4.509 1.06 1.061-5.575 5.575zm1.015-12.075c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9z"></path>';

document.body.addEventListener("click", handleClick);
document.body.addEventListener("keypress", handleEnter);

const listTemplate = document.getElementById("list-template").content;
const itemTemplate = listTemplate.querySelector(".task:not(.completed-task)");
//document.body.append(listTemplate.firstElementChild);

const addListButton = document.getElementById("btn-add-list").parentNode;

var editingTask = null;

function createAList(title) {
    var newList = document.importNode(
        listTemplate,
        true
    );
    console.log(addListButton.nextElementSibling);
    newList.lastElementChild.getElementsByClassName("list-title")[0].innerText = title;
    document.body.insertBefore(newList, addListButton.nextElementSibling); 
}

createAList("abc");
createAList("xyz");
function handleEnter(e) {
    if (e.code != "Enter")
        return;

    console.log("I'm enter?");
    console.log(e);
    if(e.target.classList.contains("task-input")) {
        handleAdd(e);
    } else if (e.target.classList.contains("task-edit")) {
        handleFinishEdit(e);
    }
}

function handleClick(e) {
    console.log("I'm here");
    if (e.target.closest(".btn-add")) {
        handleAdd(e);
        return;
    } 
    
    if (editingTask && (e.target.closest(".btn-edit") || e.target.closest(".btn-delete"))) {
        alert("Please complete the current edit");
        return;
    }

    if (e.target.closest(".checkbox")) {
        handleCheck(e);
    } else if (e.target.closest(".btn-delete")) {
        handleDelete(e);
    } else if (e.target.closest(".btn-edit")) {
        handleEdit(e);
    } else if (e.target.closest(".btn-collapse")) {
        handleCollapse(e);
    } else if (e.target.closest("#btn-add-list")) {
        createAList("Test")
    }
}

function handleDelete(e) {
    console.log("Click on delete");
    var item = e.target.closest("li");
    item.remove();
}

function handleEdit(e) {
    console.log("Click on edit");

    editingTask = e.target;
    var item = e.target.closest("li");
    var textSpan = item.getElementsByClassName("task-text")[0];
    var text = textSpan.innerText;
    textSpan.innerHTML= '<input class="form-control task-edit" type="text">';
    var newInput = textSpan.getElementsByClassName("task-edit")[0];
    newInput.focus();
    newInput.value = text;
}

function handleFinishEdit(e) {
    console.log("Done edit");
    var item = e.target.closest("li");
    var text = item.getElementsByClassName("task-edit")[0].value;
    item.getElementsByClassName("task-text")[0].innerText= text;
    editingTask = null;
}

function createItem(add_item, task) {
    console.log(itemTemplate);

    var newNode = document.importNode(
        itemTemplate,
        true
    );

    console.log(task);
    newNode.getElementsByClassName("task-text")[0].innerText = task;
    add_item.parentNode.insertBefore(newNode, add_item.nextElementSibling);
}

function handleAdd(e) {
    console.log("Click on add");
    var add_item = e.target.closest("li");
    var inp = add_item.getElementsByTagName("input")[0];
    if (inp.value !== "") {
        createItem(add_item, inp.value);
        inp.value = "";
    }
}

function handleCollapse(e) {
    var btn = e.target.closest(".btn-collapse");
    console.log( btn.getAttribute("aria-expanded") === "true");
    var expanded = btn.getAttribute("aria-expanded") === "true";
    btn.getElementsByTagName("b")[0].innerHTML=(expanded?"Show":"Hide") + " completed tasks";
    var tasks = btn.closest("ul").querySelectorAll(".task.completed-task" + (expanded?".show":".collapse"));
    for(var task of tasks) {
        task.classList.toggle("show");
        task.classList.toggle("collapse");
    }
    btn.setAttribute("aria-expanded", !expanded);
}

function markUncomplete(list, complete, item) {
    item.classList.remove("completed-task");
    item.querySelector(".checkbox").innerHTML= svg_tick;
    list.insertBefore(item, complete);
}

function markComplete(list, complete, item) {
    item.classList.add("completed-task");
    item.querySelector(".checkbox").innerHTML= svg_tick_fill;
    console.log(complete.getElementsByTagName("button")[0].getAttribute("aria-expanded"));
    if (complete.getElementsByTagName("button")[0].getAttribute("aria-expanded") !== "true") {
        item.classList.remove("show");
        item.classList.add("collapse");
    }
    list.insertBefore(item, complete.nextElementSibling);
}

function handleCheck(e) {
    console.log("Click on checkbox");
    var item = e.target.closest("li");
    var list = item.parentNode;
    var complete = list.querySelector(".complete-collapse");

    if(item.classList.contains("completed-task")) {
        markUncomplete(list, complete, item);
    } else {
        markComplete(list, complete, item);
    }

    console.log(list);

    console.log(complete);
}