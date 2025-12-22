import nodeCron, { NodeCron } from "node-cron";
import agenda,{Agenda} from 'agenda'
import { checkDueContribution } from "./contributionService";
 
export enum Services {
    contribution_background_service = 'contribution_background_service'
 }

export class BackgroundService  {

 private static backgroundServiceInstance?:BackgroundService
  jobScheduler?:Agenda

 private constructor  (){
 this.jobScheduler =new Agenda({db:{address:process.env.STAGING_URL_AGENDA!!,collection:'schedule-task'},processEvery:'5 seconds'})

  this.jobScheduler?.define('process-contribution', async (job:any) => {

  const { contribution_id, group_id, dueDate } = job.attrs.data;

    



  
 // console.log(`Processing contribution ${contribution_id} for group ${group_id}`);
  // Your logic here...
checkDueContribution(contribution_id,group_id,this.jobScheduler!!)

});

 this.jobScheduler.start().then(()=>{
  console.log(`started...`)

   

 })

 }


  static getInstance = async () =>{

    if(this.backgroundServiceInstance){
        return this.backgroundServiceInstance
    }
    this.backgroundServiceInstance = new BackgroundService()
    return this.backgroundServiceInstance

 }



   getJobSchedular = async () =>{
  return   this.jobScheduler
 }


 /*startBackgroundService  = (serviceName:Services,time:string) =>{
  
    this.agendaInstance?.define('send_welcome_email', async (job:any) => {
  //const { email } = job.attrs.data;
  console.log(`Sending email to me`);
});

   this.agendaInstance?.define(serviceName.toString(), async (job:any) => {
  //const { email } = job.attrs.data;
  console.log(`Sending email to me ....... ${serviceName.toString()}`);
});




this.agendaInstance?.start().then(()=>{

 this.agendaInstance?.every('5 seconds',  serviceName.toString(),{});

})



 }*/


   
}