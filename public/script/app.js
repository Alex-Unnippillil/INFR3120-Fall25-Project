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
                    // priority is now optional with a default value
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
                    var tasks = JSON.parse(localStorage.getItem(key) || "[]");
                    tasks.push(task);
                    localStorage.setItem(key, JSON.stringify(tasks));
                }catch(err){
                    console.error("Couldn't save to the localStorage", err);
                    alert("Sorry, couldn't save your task right now.");
                    return;
                }
                if(window.bootstrap){
                    var modalEl = document.getElementById('createTaskModal');
                    var modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
                    if(modal){ modal.hide(); }
                }
                //route to the schedule page
                window.location.href = '/schedule';                // add redirect to schedule page
            });
        }
    }

    window.addEventListener("load", start);
})();