import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from "graphql";


const daoProposalType= new GraphQLObjectType({
    name:'dao_proposal',
    fields:{
    proposal_id:{type: new GraphQLNonNull(GraphQLID)},
    created_at:{type: new GraphQLNonNull(GraphQLString)},
    expires_at:{type: new GraphQLNonNull(GraphQLString)},
    proposal_delay:{type: new GraphQLNonNull(GraphQLInt)},
    proposer_id:{type: new GraphQLNonNull(GraphQLString), 'description': 'The wallet address of the proposer'},
    proposal_description:{type: new GraphQLNonNull(GraphQLString)},
    proposal_title:{type: new GraphQLNonNull(GraphQLString)},
    isCustom:{type: new GraphQLNonNull(GraphQLInt)}
    }
});


const daoMemberType = new GraphQLObjectType({
    name:'dao_member',
    fields:{
    userWalletAddress:{type: new GraphQLNonNull(GraphQLID)},
    created_at:{type: new GraphQLNonNull(GraphQLString)},
    discord_member_id:{type: new GraphQLNonNull(GraphQLInt)},
    nickname:{type: new GraphQLNonNull(GraphQLString)},
    isAdmin:{type: new GraphQLNonNull(GraphQLString)},
    photoURL:{type: new GraphQLNonNull(GraphQLString)},
    dao_proposals:{type: new GraphQLNonNull(new GraphQLList(daoProposalType))},
    }
});

const daoCalldataObjectType= new GraphQLObjectType({
    name:'calldata_object',
    fields:{
            id:{type: new GraphQLNonNull(GraphQLString)},
    proposal_id:{type: new GraphQLNonNull(GraphQLString)},
    method_signature:{type: new GraphQLNonNull(GraphQLString)},
    target_address:{type: new GraphQLNonNull(GraphQLString)},
    value:{type: new GraphQLNonNull(GraphQLInt)},
    addressParameter:{type: new GraphQLNonNull(GraphQLString)},
    amountParameter:{type: new GraphQLNonNull(GraphQLInt)},
    isFunctionRewarding:{type: new GraphQLNonNull(GraphQLBoolean)},
    isFunctionPunishing:{type: new GraphQLNonNull(GraphQLBoolean)},
    functionDisplayName:{type: new GraphQLNonNull(GraphQLString)},
    }
});

const daoProposalCommentType= new GraphQLObjectType({
    name:'dao_voting_comments',
    fields:{
        id:{type: new GraphQLNonNull(GraphQLInt)},
        proposal_id:{type: new GraphQLNonNull(GraphQLString)},
        user_wallet_id:{type: new GraphQLNonNull(GraphQLString)},
        message:{type: new GraphQLNonNull(GraphQLString)},
        created_at:{type: new GraphQLNonNull(GraphQLString)},
    }
})


const daoMonthActivity= new GraphQLObjectType({
    name:'dao_month_activity',
    fields:{
         id: { type: new GraphQLNonNull(GraphQLID) },
    reward_month: { type: new GraphQLNonNull(GraphQLString)},
    daily_sent_reports: { type: new GraphQLNonNull(GraphQLInt)},
    general_chat_messages:  { type:new GraphQLNonNull(GraphQLInt)},
    crypto_discussion_messages:  { type:new GraphQLNonNull(GraphQLInt)},
    resource_share:  { type:new GraphQLNonNull(GraphQLInt)},
    member_id:  { type:new GraphQLNonNull(GraphQLInt)},
    votings_participated:  { type: new GraphQLNonNull(GraphQLInt)},
    proposals_accepted:  { type:new GraphQLNonNull(GraphQLInt)},
    proposals_created: { type: new GraphQLNonNull(GraphQLInt)},
    problems_solved:  { type: new GraphQLNonNull(GraphQLInt)},
    }
});

const notificationType= new GraphQLObjectType({
    name:'notification',
    fields:{
        id:{type: new GraphQLNonNull(GraphQLInt)},
        createdAt:{type: new GraphQLNonNull(GraphQLString)},
        receivedAt:{type: new GraphQLNonNull(GraphQLString)},
        isRead:{type: new GraphQLNonNull(GraphQLBoolean)},
        directedUser:{type: new GraphQLNonNull(GraphQLString)},
        message:{type: new GraphQLNonNull(GraphQLString)},
        unvotedProposalId:{type: new GraphQLNonNull(GraphQLString)}
    }
});

const voteOptionType= new GraphQLObjectType({
    name:'vote_option',
    fields:{
 
    id:{type: new GraphQLNonNull(GraphQLID)},
    proposal_id:{type: new GraphQLNonNull(GraphQLString)},
    calldata_indices:{type: new GraphQLNonNull(new GraphQLList(GraphQLInt))},
    voteOptionIndex:{type: new GraphQLNonNull(GraphQLInt)},
    isExecuting:{type: new GraphQLNonNull(GraphQLBoolean)},
    isDefeating:{type: new GraphQLNonNull(GraphQLBoolean)},
    voting_option_text:{type: new GraphQLNonNull(GraphQLString)}

    }
});

const notificationSettings= new GraphQLObjectType({
    name:'notification_settings',
    fields:{
        id:{type: new GraphQLNonNull(GraphQLInt)},
        userWalletAddress:{type: new GraphQLNonNull(GraphQLString)},
        notifyOnNewProposals:{type: new GraphQLNonNull(GraphQLBoolean)},
        notifyOnExecution:{type: new GraphQLNonNull(GraphQLBoolean)},
        notifyOnVote:{type: new GraphQLNonNull(GraphQLBoolean)},
        notifyOnUnvoted:{type: new GraphQLNonNull(GraphQLBoolean)},
        updateAt:{type: new GraphQLNonNull(GraphQLString)},
        endpoint:{type: new GraphQLNonNull(GraphQLString)},
        auth_key:{type: new GraphQLNonNull(GraphQLString)},
        p256h_key:{type: new GraphQLNonNull(GraphQLString)},
        notifyOnCancel:{type: new GraphQLNonNull(GraphQLBoolean)},
        notifyOnSuccess:{type: new GraphQLNonNull(GraphQLBoolean)}
    }
});

const voiceChatActivity= new GraphQLObjectType({
    name:'voice_chat_participation',
    fields:{
        id: {type: new GraphQLNonNull(GraphQLID)},
created_at: {type: new GraphQLNonNull(GraphQLString)},
message: {type: new GraphQLNonNull(GraphQLString)},
member_id:{type: new GraphQLNonNull(GraphQLInt)},
voice_chat_id:{type: new GraphQLNonNull(GraphQLString)},
minutes_spent:{type: new GraphQLNonNull(GraphQLInt)},
minutes_mic_on:{type: new GraphQLNonNull(GraphQLInt)},
is_stage:{type: new GraphQLNonNull(GraphQLBoolean)},
chat_timestamp: {type: new GraphQLNonNull(GraphQLString)},
    }
})

export {
    daoMemberType,
    daoProposalType,
    daoCalldataObjectType,
    daoMonthActivity,
    notificationType,
    voteOptionType,
    notificationSettings,
    voiceChatActivity,
    daoProposalCommentType
}