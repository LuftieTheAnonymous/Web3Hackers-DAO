
import React from 'react'
import Comment from './Comment'

type Props<T> = {commentsData: T[], }

function CommentList<T>({commentsData}: Props<T>) {

  return (
    <div className="max-h-[32rem] min-h-96 h-full w-full flex flex-col px-1 py-4 overflow-y-auto gap-2">
      {commentsData.length === 0 && <p className='text-white text-lg text-center'>No comments yet</p>}
   {commentsData && commentsData.length > 0 && commentsData.map((commentObj, index) => <Comment key={index}  commentObj={commentObj} />)}
  </div>
  )
}

export default CommentList