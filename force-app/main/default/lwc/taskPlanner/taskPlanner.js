import { LightningElement, track, wire, api } from 'lwc';
import getSelectedDateTasks from '@salesforce/apex/taskPlannerController.getSelectedDateTasks';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';


// const STATUS_PENDING_CLASS = "slds-item pending";
// const STATUS_COMPLETE_CLASS = "slds-item completed";

export default class TaskPlanner extends LightningElement {
  @track currentDate = this.todaysDate();
  @track taskName;
  @track taskDate;
  @track taskDuration;
  @track taskRemarks;
  @track recordsOfGetSelectedDateTasks;
  @track showTasks = true;
  //trackable variable to getSelectedDateTasks() method whenever new record is inserted or updated.
  @track dataModifier = 0;  
  @track draftValues = [];
  @track recordsStatus =false;

  columns = [
    { label: 'Name', fieldName: 'Task_Name__c', type: 'text', editable: 'true'  },   
    { label: 'Hrs', fieldName: 'Task_Duration__c', type: 'number', editable: 'true', fixedWidth: 80, hideDefaultActions: true },
    { label: 'Remarks', fieldName: 'Task_Remarks__c', type: 'text', editable: 'true' },
    { label: 'Status', fieldName: 'Task_Complete__c', type: 'boolean', editable: 'true',hideDefaultActions: true,fixedWidth: 80 }
];

  /*
   * @desc inputNameHandler function accepts taskName input field value and saves in a variable.
   * @param event.
   * @return nothing.
   */
  inputNameHandler(event) {
    console.log("Inside inputNameHandler() function");
    this.taskName = event.target.value;
    console.log("this.taskName :" + this.taskName);
  }

  /*
   * @desc inputDateHandler function accepts date input field value and saves in a variable.
   * @param event.
   * @return nothing.
   */
  inputDateHandler(event) {
    console.log("Inside inputDateHandler() function");
    this.taskDate = event.target.value;
    console.log("this.taskDate :" + this.taskDate);
  }

  /*
   * @desc inputDurationHandler function accepts taskDuration input field value and saves in a variable.
   * @param event.
   * @return nothing.
   */
  inputDurationHandler(event) {
    console.log("Inside inputDurationHandler() function");
    this.taskDuration = event.target.value;
    console.log("this.taskDuration :" + this.taskDuration);
  }

  /*
   * @desc inputRemarksHandler function accepts remarks input field value and saves in a variable.
   * @param event.
   * @return nothing.
   */
  inputRemarksHandler(event) {
    console.log("Inside inputRemarksHandler() function");
    this.taskRemarks = event.target.value;
    console.log("this.taskRemarks :" + this.taskRemarks);
  }

  /*
   * @desc to get current date.
   * @param no parameter.
   * @return Date - current date.
   */
  todaysDate() {
    console.log("Inside  todaysDate() funtion");
    this.today = new Date();
    let dd = String(this.today.getDate()).padStart(2, "0");
    let mm = String(this.today.getMonth() + 1).padStart(2, "0");
    let month = "";
    //console.log("value of this.mm :"+ this.mm);
    let yyyy = this.today.getFullYear();
    this.today = yyyy + "-" + mm + "-" + dd;
    //console.log("value of mm :"+ mm);
    //console.log(this.today);
    return this.today;
  }

  /*
   * @desc date handler function accepts date input field value and saves in a variable in required format.
   * @param event.
   * @return nothing.
   */
  dateChangeHandler(event) {
    console.log("Inside dateChangeHandler() function");
    this.currentDate = event.target.value;
    this.taskDate = null;
    //console.log('Current Date: ' + this.currentDate);
    //converts date from input field into required format.
    // this.currentDateFormatted = this.ConvertDateFormat(this.currentDate);
  }

  /*
   * @desc reset handler function resets all the input fields.
   * @param event.
   * @return nothing.
   */
  resetTaskHandler(event) {
    console.log("Inside resetTaskHandler() function");
    this.taskName = "";
    this.taskDate = null;
    this.taskDuration = null;
    this.taskRemarks = "";    
  }

  /*
   * @desc Task Editor Button handler function displays list of records in record-edit-form to make changes in the record.
   * @param event.
   * @return nothing.
   */
  taskEditorHandler(event) {
    console.log("Inside taskEditorHandler() function");
    if(this.showTasks){
      this.showTasks = false;
    }
    else{
      this.showTasks = true;
    }    
  }  
  
  /*
   * @desc onsave handler function edit and update the existing record from datatable.
   * @param event.
   * @return nothing.
   */
  handleSave(event) {
    console.log("Inside handleSave() function");
    const recordInputs =  event.detail.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        console.log("fields =>" + JSON.stringify(fields, null, "\t"));
        return { fields };
    });
    
    const promises = recordInputs.map(recordInput => updateRecord(recordInput));   
    Promise.all(promises).then(taskRecords => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Task Records updated',
                variant: 'success'
            })
        );    

         // Display fresh data in the datatable
         this.dataModifier = this.dataModifier + 1;
         return refreshApex(this.recordsOfGetSelectedDateTasks);
    }).catch(error => {
      this.error = error;
      this.dispatchEvent(
           new ShowToastEvent({
               title: 'Error',
               message: 'Contact System Admin!',
               variant: 'Error'
           })
       );     
  }).finally(() => {
       // Clear all draft values
       this.draftValues = [];
   });
}

// get statusClass() {
//   // return(this.boat.Id == this.selectedBoatId)
//   //   ? TILE_WRAPPER_SELECTED_CLASS
//   //   : TILE_WRAPPER_UNSELECTED_CLASS;
// }

  /*
   * @desc createTaskRecord function to create  record in the Custom Task_Record__c Object.
   * @param event.
   * @return nothing.
   */
  createTaskRecord() {
    console.log("Inside createTaskRecord() function");
    //defining key-value pairs in a object for the required fields to be used in creating record.
    const fields = {
        "Task_Name__c": this.taskName,
        "Task_Date__c": this.taskDate,
        "Task_Duration__c": this.taskDuration,
        "Task_Remarks__c": this.taskRemarks
      };
    // console.log(fields);
     console.log(JSON.stringify(fields, null, "\t"));

      //storing the object and related field location in a variable.
      const recordInput = { apiName: "Task_Record__c", fields };
      console.log('Record Input' + recordInput);
      //creating record in the Org Object using createRecord Api.
      createRecord(recordInput)
        .then((response) => {
          console.log('TaskRecord has been added successfully :',response.id);
          //to invoke getSelectedDateTasks() function.          
          //console.log('Data Modifier Value' + this.dataModifier);
          //gives toast notification on Success.
          this.dataModifier = this.dataModifier + 1;
          const showCreateRecordSuccess = new ShowToastEvent({
            title: "Success!",
            message: "Task record has been added successfully",
            variant: "Success"
          });
          this.dispatchEvent(showCreateRecordSuccess);
          this.taskName = "";
          this.taskDate = null;
          this.taskDuration = null;
          this.taskRemarks  = "";
          //refreshApex(this.recordsOfGetSelectedDateTasks);
        })
        .catch((error) => {
          //gives toast notification on Error.
          const showCreateRecordError = new ShowToastEvent({
            title: "Error!",
            message: "Please enter the valid data",
            variant: "error"
          });
          this.dispatchEvent(showCreateRecordError);
          console.log('Error in adding record: ',error.body.message);
        });
   
  }

  @wire(getSelectedDateTasks, {
    currentDate: "$currentDate" , dataModifier: "$dataModifier"
  })
  wiredTasks({ error, data }) {
    console.log('Inside getSelectedDateTasks() function');
    if (data) {
      //assigns list of string containing selected date records, returned from apex class funtion to dataOfGetSelectedDateExpenses variable.
      this.recordsOfGetSelectedDateTasks = data;
      if (Array.isArray(this.recordsOfGetSelectedDateTasks) && this.recordsOfGetSelectedDateTasks.length) 
               {
                this.recordsStatus = true; 
               } 
            else {
                this.recordsStatus = false; 
            }
      console.log("this.recordsStatus :" + this.recordsStatus);
      console.log('recordsOfGetSelectedDateTasks:' + JSON.stringify(this.recordsOfGetSelectedDateTasks, null, '\t'));
      
    } else if (error) {
      console.log('Error in getSelectedDateTasks() function');
    }
  } 


// 
accordianSection = '';

    handleToggleSection(event) {
          if(this.accordianSection.length === 0){
            this.accordianSection =''
        }
        else{
            this.accordianSection ='Account'
        }

    }
//

//DELETE RECORD HANDLER
/*
    * @desc accepts delete input value and deletes it from the custom setting in the Org.
    * @param event.
    * @return nothing.
    */   
   deleteTaskHandler(event) {
    console.log('Inside deleteTaskHandler() function');
    console.log('event' + event);
    console.log('event.target.name' + event.target.name);
    let recordId = event.target.name;
    deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Task deleted Successfully',
                        variant: 'success',
                    }),
                );
               // this.dataModifier = this.dataModifier + 1;
               ++(this.dataModifier);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error While Deleting Task',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });


   

     

   
  }





  
}