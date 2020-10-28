public with sharing class taskPlannerController {
    
    /*
     * @desc to fetch all records of a particular date.
     * @param Date - currentDate, Integer - dataModifier, String-defaultSymbol.
     * @return List of Expense Record type.
     */ 
    @AuraEnabled(cacheable=true)
    public static List<Task_Record__c> getSelectedDateTasks(Date currentDate, Integer dataModifier)
    {
        //List<Task_Record__c> newListOfTasks = new List<Task_Record__c>();
              
        List<Task_Record__c> listOfTasks = [SELECT Id, Task_Complete__c,Task_Date__c, Task_Duration__c ,Task_Name__c, Task_Remarks__c from Task_Record__c where Task_Date__c=:currentDate  order by CreatedDate asc ];
        return listOfTasks;
        // for(Expense_Record__c expRecord: listOfExpenses) {
        //     expRecord.Default_Currency__c = defaultSymbol + ' ' + String.valueOf(expRecord.ExpenseAmount__c);
        //     expRecord.Sr_no__c = String.valueOf(srNo);
        //     srNo++;
        //     newListOfExpenses.add(expRecord);
        // }        
        // return newListOfExpenses;
    } 
    
}