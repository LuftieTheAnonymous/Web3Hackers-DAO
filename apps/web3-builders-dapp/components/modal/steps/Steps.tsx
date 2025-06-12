'use client';

import React, { use, useCallback, useState } from 'react'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Button } from '../../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import OptionToCall from './custom/OptionToCall'
import { Control, FieldValues, FormState, useFieldArray, UseFormClearErrors, useFormContext, UseFormGetValues, UseFormRegister, UseFormSetError, UseFormSetValue, UseFormWatch, UseFromSubscribe } from 'react-hook-form'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { supabase } from '@/lib/db/supabaseConfigClient'
import Image from 'next/image'



type Props = {
  register:UseFormRegister<FieldValues>,
  formState:FormState<FieldValues>,
  getValues: UseFormGetValues<FieldValues>,
  watch:  UseFormWatch<FieldValues>,
  setValue: UseFormSetValue<FieldValues>,
  clearErrors: UseFormClearErrors<FieldValues>,
  setError: UseFormSetError<FieldValues>,
  subscribe: UseFromSubscribe<FieldValues>
  control: Control<FieldValues, any, FieldValues>

}

 function FirstStepContent({setValue, control, watch}: Props) {
  return (
    <>
<FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>Title</FormLabel>
              <FormControl>
                <Input className='border text-white border-(--hacker-green-4)' placeholder="Proposal Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={control}
          name="isCustom"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>Voting Type</FormLabel>
              <FormControl>
              <Select {...field} value={watch("isCustom")} onValueChange={(value) => {
                console.log(value);
setValue('isCustom', value);
  }}>
  <SelectTrigger className="w-full text-white border border-(--hacker-green-4)">
    <SelectValue placeholder="Voting Type" />
  </SelectTrigger>
  <SelectContent className='bg-zinc-800 border border-(--hacker-green-4)'>
    <SelectItem className='text-white' value="standard">Standard Voting</SelectItem>
    <SelectItem className='text-white' value="custom">Custom Voting</SelectItem>
  </SelectContent>
</Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



<FormField
          control={control}
          name="shortDescripton"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>Description (Onchain)</FormLabel>
              <FormControl>
                <Input className='border text-white border-(--hacker-green-4)' placeholder="Proposal Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>Description (Offchain)</FormLabel>
              <FormControl>
              <Textarea {...field}  id='textarea'  className='text-white border border-(--hacker-green-4) outline-none resize-none
  h-28
  '
  placeholder='Enter your proposal description...'
  />  
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />





    </>
  )
}


 function SecondStepContent({
  watch,
  control,
  setValue
 }: Props) {

const {fields, append} = useFieldArray({name: 'functionsCalldatas', control});

const [members, setMembers]=useState<any[]>([]);
const [isLoading, setIsLoading] = useState(false);

const [callDataIndex, setCallDataIndex] = React.useState(0);

const openChangeSetMembers=async ()=>{
  setIsLoading(true);
const {data}= await supabase.from('dao_members').select('*');

if(data && members.length === 0){
  setMembers(data);
}

setIsLoading(false);


}


  return (
    <>

<FormField
          control={control}
          name="urgencyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>Urgency Level</FormLabel>
              <FormControl>
              <Select {...field}
  value={field.value.toString()}
  onValueChange={(value) => {
    setValue('urgencyLevel', BigInt(value));
  }}
  >
  <SelectTrigger className="w-full text-white border border-(--hacker-green-4)">
    <SelectValue placeholder="Proposal Urgency" />
  </SelectTrigger>
  <SelectContent className='bg-zinc-800 border border-(--hacker-green-4)'>
    <SelectItem className='text-white' value="0">Low</SelectItem>
    <SelectItem className='text-white' value="1">Medium</SelectItem>
    <SelectItem className='text-white' value="2">High</SelectItem>
  </SelectContent>
</Select>
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

{fields.length > 0 && <div className='flex justify-between py-4 px-2 items-center gap-4'>
  <Button disabled={callDataIndex <= 0} onClick={(e) => {
   e.preventDefault();
   setCallDataIndex(callDataIndex - 1); 
  }}>
    <ArrowLeft/>
  </Button>

<p className='text-white'>{callDataIndex + 1}/{fields.length}</p>

  <Button disabled={callDataIndex >= fields.length - 1} onClick={(e) => {
    e.preventDefault();
    setCallDataIndex(callDataIndex + 1)
    }}>
    <ArrowRight/>
  </Button>
  </div>}
{fields.map((field, index) => (
callDataIndex===index && <div key={field.id}>
<FormField
          control={control}
          
          name={`functionsCalldatas.${index}.calldata`}
          render={({ field }) => (
            <FormItem className='py-2'>
              <FormLabel className='text-white text-base font-light'>Function to call on chain</FormLabel>
              <FormControl>
              <Select 
 onValueChange={
  (value) => {
    setValue(`functionsCalldatas.${index}.calldata`, value);
  }
 }
 {...field}
 >
  <SelectTrigger className="w-full text-white border border-(--hacker-green-4)">
    <SelectValue placeholder="Proposal Function" />
  </SelectTrigger>
  <SelectContent className='bg-zinc-800 border flex  border-(--hacker-green-4)'>
    <SelectItem className='text-white' value="rewardUser(address, uint256)">
      Reward User With Tokens
      </SelectItem>
    <SelectItem className='text-white' value="punishMember(address, uint256)">Punish User Account</SelectItem>
  </SelectContent>
</Select>
                
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

    
      {watch(`functionsCalldatas.${index}.calldata`) && watch(`functionsCalldatas.${index}.calldata`).trim() !== '' && <>
    <FormField
              control={control}
              name={`functionsCalldatas.${index}.destinationAddress`}
              render={({ field }) => (
                <FormItem className='py-2'>
                  <FormLabel className='text-white text-base font-light'>Destination Address</FormLabel>
                  <FormControl>
        <Select 
        onOpenChange={openChangeSetMembers}
 onValueChange={
  (value) => {
    setValue(`functionsCalldatas.${index}.destinationAddress`, value);
  }
 }
 {...field}
 >
  <SelectTrigger  className="w-full text-white border border-(--hacker-green-4)">
    <SelectValue placeholder="Proposal Receiver" />
  </SelectTrigger>
  <SelectContent className='bg-zinc-800 border flex  border-(--hacker-green-4)'>

{isLoading && <p className='text-white'>Loading...</p>}

{!isLoading && members.map((member) => (
  <SelectItem className='text-white' value={member.userWalletAddress}>
    <Image src={member.photoURL} alt={member.nickname} className='w-6 h-6 rounded-full' width={50} height={50}/>

    <p>{member.nickname}</p>
  </SelectItem>
))}
  </SelectContent>
</Select>
                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
    
    <FormField
              control={control}
              name={`functionsCalldatas.${index}.tokenAmount`}
              render={({ field }) => (
                <FormItem className='py-2'>
                  <FormLabel className='text-white text-base font-light'>Amount</FormLabel>
                  <FormControl>
    <Input min={1} max={1500} {...field} onChange={(e) => setValue(`functionsCalldatas.${index}.tokenAmount`, BigInt(e.target.value))} value={Number(watch(`functionsCalldatas.${index}.tokenAmount`))} id='tokenAmount' placeholder='Enter the user address' type='number'
    className='text-white border border-(--hacker-green-4) outline-none '/>
                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />  
      </>}
  </div>
))}



<Button onClick={(e) => {
e.preventDefault();

append({
  calldata: '',
  destinationAddress: '',
  target:'0xA6fE76578f31a1a1e11276514B5E53Df4C458A26',
  tokenAmount: BigInt(0),
  value: BigInt(0)
})
}} className='hover:bg-(--hacker-green-4) hover:scale-95 cursor-pointer transition-all duration-500  px-6 hover:text-zinc-800 '>
  Insert New Calldata
  </Button>

    </>
  )
}


interface ThirdStepContentProps extends Props {
  isCustom: boolean
  
}

 function ThirdStepContent({isCustom,control, watch
 }: ThirdStepContentProps) {



const {fields}=useFieldArray({
  control,
  name:'functionsCalldatas'
});

const {fields: customVotesFields, append: customVotesAppend, remove: customVotesRemove, update: customVotesUpdate, prepend: customVotesPrepend}=useFieldArray({
  control,
  name:'customVotesOptions'
})

const [optionId, setOptionId] = useState<number>(0);

const goBack=useCallback(() => {
  setOptionId(optionId - 1);
},[optionId]);

const goForward=useCallback(() => {
  setOptionId(optionId + 1);
},[optionId]);


  return (
    <>
    {
      isCustom  &&
   <div className='flex flex-col w-full gap-4'>

{customVotesFields.length > 0 && <div className='flex justify-between py-4 px-2 items-center gap-3'>
  <Button disabled={optionId <= 0} onClick={(e)=>{
    e.preventDefault();
    goBack();
  }}>
    <ArrowLeft/>
  </Button>

<p className='text-white'>{optionId + 1}/{customVotesFields.length}</p>

  <Button disabled={optionId >= customVotesFields.length - 1} onClick={(e)=>{
    e.preventDefault();
    goForward();
  }}>
    <ArrowRight/>
  </Button>
  </div>}

  {customVotesFields.map((optionField, customVoteIdx) => (
  customVoteIdx === optionId && (
    <div className='flex flex-col gap-4' key={customVoteIdx}>
      <FormField
        control={control}
        name={`customVotesOptions.${optionId}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-white text-base font-light'>Option Description</FormLabel>
            <FormControl>
              <Input  {...field}  placeholder='Enter the user title' className='text-white border border-(--hacker-green-4) outline-none' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-col gap-3 w-full">
        {fields.map((formField, calldataIdx) => (
          <FormField
            key={formField.id}
            control={control}
            name={`customVotesOptions.${customVoteIdx}.calldataIndicies`}
            render={({ field,   }) => (
              <FormItem >
                <FormControl>
                  <OptionToCall
                  {...formField}
                  checkedStatus={watch(`customVotesOptions.${optionId}.calldataIndicies`).includes(calldataIdx)}
                  optionArrayIndices={watch(`customVotesOptions.${optionId}.calldataIndicies`)}
                    keyIndex={optionId}
                    data={field}
                    customVotesUpdate={customVotesUpdate}
                    functionToCall={watch(`functionsCalldatas.${calldataIdx}.calldata`)}
                    tokenAmount={watch(`functionsCalldatas.${calldataIdx}.tokenAmount`)}
                    index={calldataIdx} // This is what the checkbox is tied to
                title={watch(`customVotesOptions.${customVoteIdx}.title`)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
))}


   </div>
    }
    
   {!isCustom && 
   <div className='flex flex-col gap-4'>
<p>You're almost done with your standard proposal...</p>
  <p>The only thing left is to select the end date of the proposal and the delay !</p>
   </div>
   }
    </>
  )
}


 function FourthStepContent({ control, setValue, watch, setError }: Props) {
  return (
    <div className='flex flex-col gap-4'>

      {/* Proposal End Time Picker */}
      <FormField
        control={control}
        name="proposalEndTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              htmlFor="proposalEndTime"
              className='text-white text-base font-light'
            >
              Proposal End Time
            </FormLabel>

            <FormControl>
              <Popover>
                <PopoverTrigger name='proposalEndTime' asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "max-w-64 w-full pl-3 text-left hover:bg-zinc-800 font-normal text-white bg-zinc-700 border-(--hacker-green-4)"
                    )}
                  >
                    {field.value
                      ? new Date(field.value).toLocaleString()
                      : 'Select Date'}
                    <CalendarIcon className="ml-auto text-(--hacker-green-4) h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto bg-zinc-700 p-0" align="start">
                  <Calendar
                  mode="single"
              {...field}
              required
                    selected={field.value ? new Date(field.value) : undefined}
                    classNames={{
                      day_selected: 'bg-(--hacker-green-4) rounded-md hover:text-zinc-800 py-1 px-2 self-center',
                      cell: 'py-1 px-2 rounded-lg hover:bg-(--hacker-green-4) hover:text-zinc-800 transition-all duration-300 hover:scale-95 flex-1 h-8',
                      day: 'w-full hover:text-white cursor-pointer',
                      table: 'text-sm',
                      day_today: 'bg-(--hacker-green-5) text-white rounded-md px-3 py-1',
                    }}
                  onDayClick={(date: Date) => {
                      if (!date) return;

                      setValue('proposalEndTime', date);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

       <div className="flex items-center gap-3">
        <FormField
          control={control}
          name="proposalEndtimeHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-sm font-light'>
               Proposal Time (Hours)
              </FormLabel>
              <FormControl>
         
                  <Input
                    min={0}
                    max={23}
                    {...field}
                    onChange={(e) => {
                     if(watch('proposalEndTime')){
                         setValue('proposalEndtimeHour', Number(e.target.value));
                      setValue('proposalEndTime', new Date(watch('proposalEndTime').setHours(watch('proposalEndtimeHour'))));
                    return; 
                    }
                    toast.error('Please select a date first !');
                    }}
                    placeholder='Amount of time units'
                    type='number'
                    className='text-white border border-(--hacker-green-4) max-w-64 w-full outline-none'
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

            <FormField
          control={control}
          name="proposalEndtimeMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-sm font-light'>
                Proposal Time (Minutes)
              </FormLabel>
              <FormControl>
         
                  <Input
                    min={0}
                    max={59}
                    {...field}
                    onChange={(e) =>{
                    if(watch('proposalEndTime')){
                         setValue('proposalEndtimeMinutes', Number(e.target.value));
                      setValue('proposalEndTime', new Date(watch('proposalEndTime').setMinutes(Number(watch('proposalEndtimeMinutes')))));
                    return; 
                    }
                    toast.error('Please select a date and hour first !');
                    }}
                    placeholder='Amount of time units'
                    type='number'
                    className='text-white border border-(--hacker-green-4) max-w-64 w-full outline-none'
                  />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      
      </div>

      {/* Delay Input and Unit Picker */}
      <div className="flex items-center gap-3">
        <FormField
          control={control}
          name="proposalDelay"
          render={({ field }) => {

 const endTime = watch('proposalEndTime')?.getTime?.();
    const delayUnit = watch('proposalDelayUnit') || 1;

    let maxDelay = 0;

    if (endTime && !isNaN(endTime)) {
      const now = Date.now();
      const diffInSeconds = (endTime - now) / 1000;
      maxDelay = Math.floor((diffInSeconds * 0.2) / delayUnit); // 20% cap, converted to selected unit
    }
   return     (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>
                Proposal Delay
              </FormLabel>
              <FormControl>
                <div className="flex w-full gap-3 items-center">
                  <Input
                    min={0}
                    max={maxDelay}
                    {...field}
                    id="proposalDelay"
                    value={field.value ? Number(field.value) : 0}
                    
                    onChange={(e) =>{
                  if(!isNaN(watch('proposalEndTime'))){
                          const val = Number(e.target.value);
                if (val <= maxDelay) {
                  setValue('proposalDelay', val)
                }
                else{
                  toast.error(`Proposal delay can't exceed ${maxDelay} ${delayUnit === '1' ? 'seconds' : delayUnit === '60' ? 'minutes' : delayUnit === '3600' ? 'hours' : 'days'}`);
              setError('proposalDelay', { message: `Proposal delay can't exceed ${maxDelay} ${delayUnit === '1' ? 'seconds' : delayUnit === '60' ? 'minutes' : delayUnit === '3600' ? 'hours' : 'days'}` });
                  return
                };
                  }
                    }}
                    placeholder='Amount of time units'
                    type='number'
                    className='text-white border border-(--hacker-green-4) max-w-64 w-full outline-none'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )

          }
            
    }
        />

        <FormField
          control={control}
          name="proposalDelayUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>
                Proposal Units
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  value={String(field.value)}
                  onValueChange={(value) => {
  const unit = Number(value);
  setValue('proposalDelayUnit', unit);

  const endTime = watch('proposalEndTime')?.getTime?.();
  if (endTime && !isNaN(endTime)) {
    const now = Date.now();
    const diffInSeconds = (endTime - now) / 1000;
    const maxDelay = Math.floor((diffInSeconds * 0.2) / unit);
    const currentValue = watch('proposalDelay');

    if (currentValue > maxDelay) {
      setValue('proposalDelay', Number(maxDelay));
    }
  }
}}
                >
                  <SelectTrigger className="w-full max-w-32 text-white border border-(--hacker-green-4)">
                    <SelectValue placeholder="Time Unit" />
                  </SelectTrigger>
                  <SelectContent className='bg-zinc-800 border flex border-(--hacker-green-4)'>
                    <SelectItem className='text-white' value='1'>Seconds</SelectItem>
                    <SelectItem className='text-white' value='60'>Minutes</SelectItem>
                    <SelectItem className='text-white' value='3600'>Hours</SelectItem>
                    <SelectItem className='text-white' value='86400'>Days</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Timelock Period & Units (unchanged) */}
      <div className="flex items-center gap-3">
        <FormField
          control={control}
          name="timelockPeriod"
          render={({ field }) => {

             const endTime = watch('proposalEndTime')?.getTime();
    const delayUnit = watch('timelockUnit') || 1;

    let maxTimelock = 0;

    if (endTime && !isNaN(endTime)) {
      const now = Date.now();
      const diffInSeconds = (endTime - now) / 1000;
      maxTimelock = Math.floor((diffInSeconds * 0.2) / Number(delayUnit)); // 20% cap, converted to selected unit
    }


            return (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>
                Proposal Timelock
              </FormLabel>
              <FormControl>
                <div className="flex w-full gap-3 items-center">
                  <Input
                    min={0}
                    max={maxTimelock}
                    {...field}
                    id='timelockPeriod'
                    value={field.value ? Number(field.value) : 0}
                    onChange={(e) => setValue('timelockPeriod', Number(e.target.value))}
                    placeholder='Amount of time units'
                    type='number'
                    className='text-white border border-(--hacker-green-4) max-w-64 w-full outline-none'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
          }}
        />

        <FormField
          control={control}
          name="timelockUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-white text-base font-light'>
                Timelock Units
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  value={String(field.value)}
                 onValueChange={(value) => {
  const unit = Number(value);
  setValue('timelockUnit', unit);

  const endTime = watch('proposalEndTime')?.getTime();
  if (endTime && !isNaN(endTime)) {
    const now = Date.now();
    const diffInSeconds = (endTime - now) / 1000;
    const maxTimelock = Math.floor((diffInSeconds * 0.2) / unit);
    const currentValue = watch('timelockPeriod');

    if (currentValue > maxTimelock) {
      setValue('timelockPeriod', maxTimelock);
    }
  }
}}
                >
                  <SelectTrigger className="w-full max-w-32 text-white border border-(--hacker-green-4)">
                    <SelectValue placeholder="Time Unit" />
                  </SelectTrigger>
                  <SelectContent className='bg-zinc-800 border flex border-(--hacker-green-4)'>
                    <SelectItem className='text-white' value='1'>Seconds</SelectItem>
                    <SelectItem className='text-white' value='60'>Minutes</SelectItem>
                    <SelectItem className='text-white' value='3600'>Hours</SelectItem>
                    <SelectItem className='text-white' value='86400'>Days</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

    </div>
  );
}



interface StepProps{
currentStep?:number
}

function SummaryStep({getValues}:Props){
  return (
    <div className='flex flex-col gap-3'>
       <p className='text-white text-2xl font-semibold'>Summary</p>
       <div className="w-full overflow-y-auto flex flex-col gap-2">
        <div className="w-full flex justify-between items-center px-3 py-2 gap-2">
          <p className='text-white'>Proposal Title</p>
          <p className='text-(--hacker-green-4)'>{getValues('title')}</p>
        </div>

        <div className="w-full flex justify-between items-center px-3 py-2 gap-2">
          <p className='text-white'>Urgency Level</p>
          <p className='text-(--hacker-green-4)'>{Number(getValues('urgencyLevel'))}</p>
        </div>

        <div className="w-full flex justify-between items-center px-3 py-2 gap-2">
          <p className='text-white'>Voting Type</p>
          <p className='text-(--hacker-green-4)'>{String(getValues('isCustom')).toUpperCase()}</p>
        </div>

        <div className="w-full flex justify-between items-center px-3 py-2 gap-2">
          <p className='text-white'>Proposal Title</p>
          <p className='text-(--hacker-green-4)'>{getValues('title')}</p>
        </div>
       </div>
    </div>
  )
}


export function StepContainer({currentStep}: StepProps) {
const 
{
 register,
 formState,
 getValues,
 watch,
 setValue,
 clearErrors,
 subscribe,
 setError,
 control
}=useFormContext();

 switch(currentStep){
  case 0:
    return <FirstStepContent
    register={register}
    formState={formState}
    getValues={getValues}
    watch={watch}
    setValue={setValue}
    clearErrors={clearErrors}
    setError={setError}
    subscribe={subscribe}
    control={control}
    />
  case 1:
    return <SecondStepContent
    register={register}
    formState={formState}
    getValues={getValues}
    watch={watch}
    setValue={setValue}
    clearErrors={clearErrors}
    setError={setError}
    subscribe={subscribe}
    control={control}
    />
  case 2:
    return <ThirdStepContent
    register={register}
    formState={formState}
    getValues={getValues}
    watch={watch}
    setValue={setValue}
    clearErrors={clearErrors}
    setError={setError}
    control={control}
    subscribe={subscribe}
    isCustom={watch('isCustom') === 'custom'} />
  case 3:
    return <FourthStepContent
    register={register}
    formState={formState}
    getValues={getValues}
    control={control}
    watch={watch}
    setValue={setValue}
    clearErrors={clearErrors}
    setError={setError}
    subscribe={subscribe}
    />

    case 4:
      return <SummaryStep
      register={register}
      formState={formState}
      getValues={getValues}
      control={control}
      watch={watch}
      setValue={setValue}
      clearErrors={clearErrors}
      setError={setError}
      subscribe={subscribe}
      />
  default:
    return <FirstStepContent
    register={register}
    formState={formState}
    getValues={getValues}
    watch={watch}
    control={control}
    setValue={setValue}
    clearErrors={clearErrors}
    setError={setError}
    subscribe={subscribe}
    />
}

}