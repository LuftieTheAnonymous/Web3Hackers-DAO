import { Checkbox } from '@/components/ui/checkbox'
import React from 'react'
import { ControllerRenderProps, FieldValues, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayUpdate } from 'react-hook-form'

type Props = {
  index: number,
  customVotesUpdate: UseFieldArrayUpdate<FieldValues, "customVotesOptions">,
  functionToCall: string,
  tokenAmount: number,
  destinationAddress:`0x${string}`,
  keyIndex: number,
  title: string,
  checkedStatus: boolean,
data: ControllerRenderProps<FieldValues, `customVotesOptions.${number}.calldataIndicies`>,
optionArrayIndices: number[],

}

function OptionToCall({
  data,
  index,
  keyIndex,
  customVotesUpdate,
  destinationAddress,
  functionToCall,
  title,
  tokenAmount,checkedStatus,
  optionArrayIndices
}: Props) {
  return (
   <div  key={index} className="w-full flex items-center gap-6 h-12 bg-zinc-800">
   <Checkbox {...data} value={index} checked={checkedStatus}  onCheckedChange={(value) => {
     if(value) {
       customVotesUpdate(keyIndex, {title, calldataIndicies: [...optionArrayIndices, index]});
     }else{
       customVotesUpdate(keyIndex, {title, calldataIndicies: optionArrayIndices.filter((item) => item !== index)});
     }
   }}  />
     <p className='text-white text-sm'>{functionToCall}{" "}<span className='text-(--hacker-green-4)'>{destinationAddress.slice(0, 10)}...</span> 
     
     {functionToCall.includes('uint256') &&
     <p>
          with <span className={`text-sm ${functionToCall === 'rewardUser(address, uint256)' ? 'text-green-500' : 'text-red-500'} text-lg font-bold`}>{tokenAmount}</span> tokens
     </p>
     }

     </p>
   </div>
   )
}

export default OptionToCall