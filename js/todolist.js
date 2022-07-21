//GLOBAL VARIABLE
let currentRow = {}; 
let edit = false;
let tableClassNames = [];
const taskTables = [{}];


// Add Table
$('#addTblBtn').click(()=>{
    showModal('tbl_modal');
});

$('.modal').on('shown.bs.modal', function(){
    $('input:text:visible').focus();
})

// TASK TABLE CLOSURE
let createTaskTable = taskTableClosure(0);
function taskTableClosure(noOfTbl){
    let sno = noOfTbl;
    return (tbl)=>{
        // Clear Values
        $('.task_body').show();
        $('#tskTblName').val("");
        if (typeof tbl == 'string') {
            tblHtmlElement(tbl);
            sno++;
        }
        else{
            $(tbl).each((i,j)=>{
                sno++;
                tblHtmlElement(j);
            });
        }
        function tblHtmlElement(tblName){
            if (tableClassNames.includes(tblName)) {
                displayMessage("Table name already exist.","failure");
                return false;
            }
            let quicktbl = "";
            let tableTemplate = $('.base-tbl-card').clone();
            $(tableTemplate[0]).removeClass('d-none base-tbl-card').addClass(`${tblName}`);
            $(tableTemplate).attr('id','quickTbl_'+sno);
            let data = `
                <h4 class="card-title">${tblName}</h4>
                <div>
                    <button class="btn addBtn" type="button" id="addBtn_${sno}" onclick="addRow(this)"><i class="fa-solid fa-circle-plus text-white fa-lg" title="Add Task"></i></button>
                    <button class="btn removeTbl" type="button" id="removeTblBtn_${sno}" onclick="removeTbl(this)"><i class="fa-solid fa-trash text-white fa-lg" title="Remove Table"></i></button>
                </div>`;
            $(tableTemplate).children().find('.card-title').html(data);
            $(tableTemplate).find('tbody').attr('id','tbody_'+sno);
            quicktbl = `<a href="#quickTbl_${sno}" class="dropdown-item q-tbl_${sno}">${tblName}</a>`;
            $('.quick-table .dropdown-menu').append(quicktbl);
            
            // Task Table Class names list
            tableClassNames.push(tblName);
            // ADD TASK TABLE
            $('.task_body').append(tableTemplate);
            if (typeof tbl == 'string') {
                taskTables[0][`${tblName}`] = [];
                setLocalStorage(taskTables);
                displayMessage(`${tblName} created successfully.`,"success");
            }
            $('#tbl_modal').modal('hide');
        }
    }
}


//CREATE TASK TABLE
function createTaskTableBTN(sessionTable){
    if ( ($('#tskTblName').val()).trim() == "" ){
        displayMessage("Please enter the table name.","failed");
        return false;
    }else if(sessionTable != null){
        createTaskTable(sessionTable);
    }
    else {
        createTaskTable(($('#tskTblName').val()).trim());
    }
};


$('#createTblModalBtn').click(function(){
    createTaskTableBTN(null);
});

// ADD ROW
let addRow = (t_this, edited = false)=>{
    // CLEAR VALUES
    $('#taskDesc').val("");
    $('#duedate').val("");
    let rowId = "";
    let tbl = $(t_this).closest('.card').attr('class').split(" ").splice(-1)[0];
    if( edited )
        rowId = $(t_this).attr('id').split('_').splice(-1)[0];
    currentRow = {tbl, rowId};
    let modal = new bootstrap.Modal(document.querySelector('#row_modal'));
    modal.show();
}


$('#addTaskBtn').click(()=>{
    if( edit ){
        let value = editExistValue();
        if ( ($('#taskDesc').val()).trim() == value.description && ($('#duedate').val()).trim() == datePickerFormat(value.duedate) ){
            displayMessage('No Updation done','failed');
            return false;
        }  
        addNewandEditRow("edit");
        edit = false;
    } else addNewandEditRow("new");
    
});
$('.close').click(()=> edit = false);

let editTask = (t_this)=>{
    edit = true;
    addRow($(t_this).closest('tr'), true);
    let description = $(t_this).closest('tr').find('.description').text();
    let duedate =$(t_this).closest('tr').find('.duedate').text();
    editExistValue = function(){
        return { description, duedate}
    }
    $('#taskDesc').val(description);
    $('#duedate').val(datePickerFormat(duedate));
};



//Add TASK
function addNewandEditRowClosure(rSno){
    let rowSno = rSno;
    return (flag)=>{
        rowSno++;
        let description = ($('#taskDesc').val()).trim();
        let duedate = ($('#duedate').val()).trim();
        let clsName = currentRow.tbl;
        let remarks ="";
        let sts = "";
        let rowId = currentRow.rowId;
        if ( typeof(flag) == "string"){
            if ( description == "" || duedate == ""){
                displayMessage("Please give the input values.",'failed');
                return false;
            } else if ( new Date(duedate) <= dateBeforeCurrentDate() ){
                displayMessage("Give Due Date is current date or greater than current date.",'failed');
                return false;
            }
            addRowTemplate(); 
        } else {
            $(tableClassNames).each((i,j)=>{
                clsName = j;
                $(flag[0][`${j}`]).each((idx, Value)=>{
                    description = Value.description;
                    duedate = Value.duedate;
                    remarks = Value.remarks;
                    sts = Value.status;
                    if ( sts != "")
                        sts = sts=="Completed" ? 2 : 1;
                    addRowTemplate();
                });
            });
        }

        function addRowTemplate(){
            // Clear Values
            $('#taskDesc').val("");
            $('#duedate').val("");
            if ( flag == "new" || typeof(flag) == 'object'){
                let sno = $('.'+clsName).closest('.card').find('.card-body tbody tr').length+1;
                let cloneRow = $('.tblRow_tr > tbody > tr').clone();
                $(cloneRow).attr('id',`row_${rowSno}`);
                if ( sts != "") $('.doneCheckBox', cloneRow).prop('checked', true);
                $('.doneCheckBox', cloneRow).attr('id',"doneCheckBox_"+sno);
                $('.sno', cloneRow).text(sno);
                $('.description', cloneRow).attr('id',`desc_${rowSno}`).text(description);
                $('.duedate', cloneRow).attr('id',`duedate_${rowSno}`).text(dateFormatter(duedate));
                if( sts != "") $(`._status option:eq(${sts})`, cloneRow).attr("selected", true);
                $('._status', cloneRow).attr('id',`status_${rowSno}`);
                if (remarks != "") $('._remarks', cloneRow).val(remarks);
                $('._remarks', cloneRow).attr('id',`remarks_${rowSno}`);
                $('.edit', cloneRow).attr('id',`edit_${rowSno}`);
                $('.remove_task', cloneRow).attr('id', `removeTask_${rowSno}`);

                $('.'+clsName).closest('.card').find('.card-body table tbody').append(cloneRow);
                if ( typeof(flag) == "string" )
                    taskTables[0][`${clsName}`].push({"sno":sno.toString(),"description":description,"duedate":dateFormatter(duedate),"status":"","remarks":""});
            } else{
                $('.'+clsName).find('#desc_'+rowId).text(description);
                $('.'+clsName).find('#duedate_'+rowId).text(dateFormatter(duedate));
                let sno = ($('.'+clsName).find('#desc_'+rowId).closest('tr').find('.sno').text()).trim();
                taskTables[0][`${clsName}`][parseInt(sno)-1].description = description;
                taskTables[0][`${clsName}`][parseInt(sno)-1].duedate = dateFormatter(duedate);
                $('#row_modal').modal('hide');
                displayMessage('Updated Successfully..!!','success');
            }
            $('#row_modal').modal('hide');
            if( typeof(flag) == "string") setLocalStorage(taskTables);
        }
        if( typeof(flag) == "object") submitedTasks(null);
    }
    
}


// REMOVE TASK
let removeTask = (t_this)=>{
    let tblBodyID = $(t_this).closest('tbody').attr('id');
    let tbl = $(t_this).closest('.card').attr('class').split(" ").splice(-1)[0];
    let i =0;
    $('#remove_modal .removeyes').attr('id','removeRow');
    $('#remove_modal label h4').text("Are you sure want to remove this task");
    showModal('remove_modal');
    Qanimte();
    $('#removeRow').off().on('click',function(){
        $(t_this).closest('tr').remove();
        displayMessage("Task Removed Successfully.",'success');
        $(`#${tblBodyID} tr`).each((i, data)=>{
            $(data).find('.sno').text(i+1);
        });
        let sno = ($(t_this).closest('tr').find('.sno').text()).trim();
        taskTables[0][`${tbl}`].splice(parseInt(sno)-1 , 1);
        setLocalStorage(taskTables);
    });
    checkEvent(null);
}

function Qanimte(){
    let interID = setInterval(()=>{
        $('.question:visible').css({'transform':'scale(0.6)','transition':'0.5s'});
        setTimeout(()=>{
            if($('.question:visible')){
                $('.question:visible').css({'transform':'scale(1.1)','transition':'0.5s'}); 
            }
        },500);
        if($('.question:visible').length == 0){
            clearInterval(interID);
        }
    },1000);
}
// REMOVE TABLE
function removeTbl(t_this){
    let tbl = $(t_this).closest('.card');
    let tblName = $(t_this).closest('.card').attr('class').split(" ").splice(-1)[0];
    let sno = $(t_this).attr('id').split('_').splice('-1')[0];
    let i = 0;
    $('#remove_modal .removeyes').attr('id','removeTbl');
    $('#remove_modal label h4').text("Are you sure want to remove this table");
    showModal('remove_modal');
    Qanimte();
    $('#removeTbl').off().on("click",function(){
        $(tbl).remove();
        $('.q-tbl_'+sno).remove();
        tableClassNames.splice(tableClassNames.indexOf(tblName),1);
        delete taskTables[0][`${tblName}`];
        if ( tableClassNames.length == 0){
            $('.task_body').hide();
        }
        setLocalStorage(taskTables);
        displayMessage(`${tblName} Table Removed Successfully.`,"success");
    });
}
// CHECK BOX
let checkEvent = (t_this)=>{
    if (t_this != null){
        if (t_this.checked)
            $(t_this).closest('tr').css("background","#7db0fb");
        else
            $(t_this).closest('tr').css("background","");
    }
    if ($('.doneCheckBox:checked').length > 0) $('#submitBtn').removeClass('d-none');
    else $('#submitBtn').addClass('d-none');     
}


// Remarks KeyUp
function inputKeyEvents(t_this){
    let clsName = $(t_this).attr('class').split(" ").splice(-1)[0];
    clsName = clsName == '_remarks' ? "_status" : "_remarks"; 
    if(($(t_this).val()).trim() != "" || $(t_this).closest('tr').find('.'+clsName).val() != ""){
        $(t_this).closest('tr').find('.doneCheckBox').prop('checked',true);
        $(t_this).closest('tr').css("background","#7db0fb");
    }
    else{
        $(t_this).closest('tr').find('.doneCheckBox').prop('checked',false);
        $(t_this).closest('tr').css("background","");
    }
    if ($('.doneCheckBox:checked').length > 0) $('#submitBtn').removeClass('d-none');
    else $('#submitBtn').addClass('d-none'); 
}


// SUBMIT TASK
function submitedTasks(flag){
    $('.doneCheckBox:checked').each((idx, data)=>{
        if(!$(data).closest('tr.inprogress').length){
            let status = $(data).closest('tr').find('._status').val();
            var tbl = $(data).closest('.card').attr('class').split(" ").splice(-1)[0];
            let sno = ($(data).closest('tr').find('.sno').text()).trim();
            let remarks = ($(data).closest('tr').find('._remarks').val()).trim();

            if ( status == ""){
                displayMessage('Status value required','failed');
                return false;
            }
            if ( status == 2){
                $(data).closest('tr').css({'pointer-events':'none'}).css('background','lightgreen');
                $(data).closest('tr').addClass('completed').find('input').attr('disabled','disabled').find('span').attr('disabled','disabled');
                $(data).parent().html(`<span class="text-white">Submitted<i class="fa-regular ms-2 fa-circle-check"></i>`);
            } else{
                $(data).closest('tr').css({'pointer-events':'none'}).addClass('bg-secondary');
                $(data).closest('tr').addClass('completed inprogress');
                $(data).prop('checked',false);
                $(data).parent().append(`<i class="fa-solid fa-lock text-white" title="Inprogress"></i>`);
                $(data).hide();
                $("#inprogressBTN").removeClass("d-none");
            } 
            if( flag == "new"){
                taskTables[0][`${tbl}`][parseInt(sno)-1].status = status == 2 ? "Completed" : "In Progress";         
                taskTables[0][`${tbl}`][parseInt(sno)-1].remarks = remarks;
            }
        }
    });
    if (flag == "new") setLocalStorage(taskTables);         
    checkEvent();
}

$('#submitBtn').click(()=>{
    submitedTasks("new");
});


// UNLOCK INPROGRESS TASK
$('#inprogressBTN').click(()=>{
    $('.inprogress').each((idx, data)=>{
        let tbl = $(data).closest('.card').attr('class').split(" ").splice(-1)[0];
        let sno = ($(data).find('.sno').text()).trim();
        taskTables[0][`${tbl}`][parseInt(sno)-1].status ="";
        taskTables[0][`${tbl}`][parseInt(sno)-1].remarks ="";
        $(data).find('.doneCheckBox').siblings().remove();
        $(data).find('.doneCheckBox').show();
        $(data).find('.doneCheckBox').prop('checked',true);
        $(data).removeClass('completed inprogress bg-secondary').removeAttr("style");
    });
    $("#inprogressBTN").addClass('d-none');
    setLocalStorage(taskTables);
    checkEvent();
});

// Completed Task
$('#completedBtn').click(()=>{
    if ($('.completed').length == 0 ){
        displayMessage("Not available in Completed or Inprogress Task", "failed");
        return false;
    } 
    let taskTitle = "";
    $('#status_modal tbody').html(""); 
    $('.completed').each((idx, data)=>{
        let submittedTask = [{}];
        let task = $(data).closest('.card').find('.card-title:eq("1")').text();
        if ( taskTitle == ""){
            taskTitle = task;
            let title = $('.submitTblBody .taskTitle').clone();
            $(title).text(taskTitle).addClass("text-center bg-success text-white");
            $('#status_modal tbody').append(title);
        } else if ( taskTitle != task){
            taskTitle = task;
            let title = $('.submitTblBody table tr.taskTitle').clone();
            $(title).text(taskTitle).addClass("text-center bg-success text-white");
            $('#status_modal tbody').append(title);
        }
        let rowData = $('.submitTblBody table tr.taskData').clone();
        let d = {
            description : $(data).find(".description").text(),
            duedate : $(data).find(".duedate").text(),
            status : $(data).find('#status').val() == 1 ? "In Progress" : "Completed",
            remarks : $(data).find("._remarks").val()
        }
        
        $(rowData).find('.sno').text(idx+1);
        $(rowData).find('.desc').text(d.description);
        $(rowData).find('.duedate').text(d.duedate);
        $(rowData).find('.status').text(d.status);
        d.remarks != "" ? $(rowData).find('.remarks').text(d.remarks) : $(rowData).find('.remarks').text("-");

        $('#status_modal tbody').append(rowData);

    });
    showModal("status_modal");
});


//SHOW MODAL
function showModal(id){
    let modal = new bootstrap.Modal(document.querySelector(`#${id}`));
    modal.show();
}

// DOWNLOAD CSV
$("#downloadCSV").click(()=>{
    let options = {"filename":`ToDo_Task_Table_${dateFormatter()}`};
    $('.csvTask').table2csv(options);
});


// Display Message
function displayMessage(msg, type){
    if (type.indexOf("success")!= -1){
        $('#toastID').css("background","#38b611")
        $("#toastID .tstBody").html('<i class="fa-solid fa-circle-check fa-lg me-2"></i>');

    } else{
        $('#toastID').css("background","#b62012")
        $("#toastID .tstBody").html('<i class="fa-solid fa-triangle-exclamation fa-lg me-2"></i>');

    }
    $('#toastID .tstBody').append(msg);
    let toastELM = document.getElementById("toastID");
    let tst = new bootstrap.Toast(toastELM);
    tst.show();
}


// Date Formatter
function dateFormatter(existDate){
    if ( existDate != null ){
        return new Date(existDate).toLocaleString('en-IN',{
            year:"numeric",month:'short', day:'2-digit'
        }).split(" ").join("-");
    } else {
        return new Date().toLocaleString('en-IN',{
            year:"numeric",month:'short', day:'2-digit'
        }).split(" ").join("-");    
    }
}

function datePickerFormat(date){
    let ddate = new Date(date).toLocaleString('en-IN',{year:"numeric",month:"2-digit",day:"2-digit"}).split('/');
    return `${ddate[2]}-${ddate[1]}-${ddate[0]}`
}

function dateBeforeCurrentDate(){
    let d= new Date();
    return new Date(d.setDate(d.getDate()-1));
}
// LOCAL STORAGE  //
function setLocalStorage(obj){
    localStorage.setItem('tasks',JSON.stringify(obj));
}

// DOCUMENT READY FUNCTION
$(document).ready(function(){
    let tblClassName = [];
    let taskDetails = localStorage.getItem('tasks');
    taskDetails = JSON.parse(taskDetails);
    addNewandEditRow = addNewandEditRowClosure(0);
    if ( taskDetails !=  null){
        tblClassName = Object.keys(taskDetails[0]);
        if(tblClassName.length !=0){
            createTaskTable(tblClassName);
            addNewandEditRow(taskDetails); 
            $(tblClassName).each((i, clsName)=>{
                taskTables[0][`${clsName}`] = taskDetails[0][`${clsName}`];
            });
        } else $('.task_body').hide();
    } else $('.task_body').hide();

});

// LOADER
function loader(){
        $('.loader').fadeOut("slow");
}

// ENTER KEYUP
$(document).keydown(function(event){
    if ($('.modal:visible'))
        if(event.keyCode == 13) event.preventDefault();
});

// HOME ICON
$(window).scroll((e)=>{
    if(window.pageYOffset > 180)$("#home").removeClass('d-none'); 
    else $("#home").addClass('d-none');
});
