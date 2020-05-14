const WORK_HOURS_IN_DAY = 8;
const MAXIMUM_OVERTIME = 99999999;
const MINIMUM_OVERTIME = -1;
const MAXIMUM_WORK_DAYS = 32;
const MINIMUM_WORK_DAYS = 0;
const UNTITLED_TASK_NAME = "Untitled Task";
var taskCounter = 0;
var totalHoursWorked = 0;

//confirms input is a number and is between the lower and upper bounds (non inclusive)
function isValidNumber(value, lower, upper) {
    if (value > lower && value < upper && (!isNaN(value))) {
        return true;
    } else {
        return false;
    }
}

function addTask() {
    ++taskCounter;
    let task = `
    <div class="task" id="task-` + taskCounter + `">
        <input type="text" class="task-name" placeholder="`+ UNTITLED_TASK_NAME + `">
        <input type="text" class="task-allocation" placeholder="0"> hours
        <button class="task-remove btn"><i class="fas fa-trash"></i></button>
    </div>
    `;
    $(".allocation-list").append(task);
}

$(".add-task").click(() => {
    addTask();
});

function recalculateUnallocated() {
    let allocatedHours = 0;
    $(".task").toArray().forEach(element => {
        let taskHours = $("#" + element.id).find('.task-allocation').val() ? parseInt($("#" + element.id).find('.task-allocation').val()) : 0;
        allocatedHours += taskHours;
    });

    $(".report-status").removeClass("report-good report-error");

    if (allocatedHours > totalHoursWorked) {
        $(".report-status").html('<i class="fas fa-exclamation-triangle"></i> ' + (allocatedHours - totalHoursWorked) + " extra hours allocated ");
        $(".report-status").addClass("report-error");
    } else if (allocatedHours < totalHoursWorked) {
        $(".report-status").html('<i class="fas fa-exclamation-triangle"></i> ' + (totalHoursWorked - allocatedHours) + " unallocated hours");
        $(".report-status").addClass("report-error");
    } else {
        $(".report-status").html('<i class="fas fa-check-circle"></i> All hours allocated');
        $(".report-status").addClass("report-good");
    }
}

$(".overtime-value, .time-value").change(function (e) {
    if (isValidNumber($(".time-value").val(), MINIMUM_WORK_DAYS, MAXIMUM_WORK_DAYS)) {
        if (isValidNumber($(".overtime-value").val(), MINIMUM_OVERTIME, MAXIMUM_OVERTIME)) {
            totalHoursWorked = (($(".time-value").val() ? parseInt($(".time-value").val()) : 0) * WORK_HOURS_IN_DAY) + ($(".overtime-value").val() ? parseInt($(".overtime-value").val()) : 0)
            $(".total-hours").html("Total hours worked: " + totalHoursWorked);

            $(".task").toArray().forEach(element => {
                if (!$("#report-" + element.id).length) {
                    addTaskReport($("#" + element.id));
                }
            });

            //recalculate task percentages
            $(".task-report").toArray().forEach(element => {
                let task = element.id.split("report-")[1];
                let taskHours = $("#" + task).find('.task-allocation').val() ? $("#" + task).find('.task-allocation').val() : 0;
                let taskPercent = (taskHours / totalHoursWorked * 100).toFixed(2) + "%";
                element.querySelector(".task-report-percent").innerHTML = taskPercent;
            });

            recalculateUnallocated();
        } else {
            $(".total-hours").html("Invalid amount of overtime input");
        }
    } else {
        $(".total-hours").html("Invalid amount of days input");
    }

});

$(document).ready(() => {
    addTask();
});

$(document).on('click', ".task-remove", function (e) {
    $(this).parent().remove();
    if ($("#report-" + $(this).parent().attr('id')).length) {
        $("#report-" + $(this).parent().attr('id')).remove();
    }
    recalculateUnallocated()
});

function addTaskReport(task) {
    let taskName = task.find(".task-name").val() ? task.find(".task-name").val() : UNTITLED_TASK_NAME;
    let taskHours = (task.find(".task-allocation").val() ? task.find(".task-allocation").val() : 0);
    let taskPercent = (taskHours / totalHoursWorked * 100).toFixed(2) + "%";
    let reportToAdd = `
    <div class="task-report" id="report-` + task.attr('id') + `">
    <h3 class="task-report-title">` + taskName + `:</h3>
    <h4 class="task-report-percent">`+ taskPercent + `</h4>
    </div>`;
    $(".report").append(reportToAdd);
}

$(document).on('change', ".task-name, .task-allocation", function (e) {
    if (totalHoursWorked > 0) {
        if (!$("#report-" + $(this).parent().attr('id')).length) {
            addTaskReport($(this).parent());
        } else {
            if (e.currentTarget.className === "task-name") {
                let newTaskName = e.currentTarget.value + ":";
                $("#report-" + $(this).parent().attr('id')).find(".task-report-title").html(newTaskName);
            } else {
                let taskHours = e.currentTarget.value ? e.currentTarget.value : 0;
                let taskPercent = (taskHours / totalHoursWorked * 100).toFixed(2) + "%";
                $("#report-" + $(this).parent().attr('id')).find(".task-report-percent").html(taskPercent);
                recalculateUnallocated();
            }
        }
    }
});