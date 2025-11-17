// IIFE

(function(){
    function start(){
        console.log("App Started");
        // Handle the create task form submission functionality for the home page
        var form = document.getElementById("taskForm");
        if(form){
            form.addEventListener("submit", function(e){
                e.preventDefault();

                var task = {
                    id: Date.now(),
                    title: document.getElementById("taskTitle").value.trim(),
                    date: document.getElementById("taskDate").value,
                    start: document.getElementById("startTime").value,
                    end: document.getElementById("endTime").value,
                    // set priority as optional
                    priority: (function(){ 
                        var el = document.getElementById("priority"); 
                        return el ? el.value : "Normal"; 
                    })(),

                    notes: document.getElementById("notes").value.trim()
                };

                if(!task.title || !task.date){
                    alert("Provide a Title and a Date.");
                    return;
                }

                var key = "plansimple.tasks";
                try{
                    var tasks = JSON.parse(localStorage.getItem(key) || "[]"); // get THE existing tasks
                    var idx = tasks.findIndex(function(t){ return String(t.id) === String(task.id); }); // check for existing task by id
                    if(idx >= 0){ tasks[idx] = task; } else { tasks.push(task); } // add new task
                    localStorage.setItem(key, JSON.stringify(tasks)); // save back to localStorage 
                }catch(err){
                    console.error("Couldn't save to the localStorage", err);
                    alert("Sorry, couldn't save your task right now.");
                    return;
                }
                // feedback and redirect to schedule page
                alert('Task "' + task.title + '" created!');
                var modalEl = document.getElementById('createTaskModal');
                if(window.bootstrap){
                    var modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;
                    if(modal){ modal.hide(); }
                }
                // route toschedule page
                window.location.href = '/schedule';

            });
        }
    }

    window.addEventListener("load", start);
})();