import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
} from 'graphql';

import {
  daoMemberType,
  daoProposalType,
  daoCalldataObjectType,
  daoMonthActivity,
  notificationType,
  notificationSettings,
  voteOptionType,
  voiceChatActivity,
  daoProposalCommentType,
} from './graphqlTypes.ts';

import {
  getDatabaseElement,
  getDatabaseElements,
  insertDatabaseElement,
  updateDatabaseElement,
  deleteDatabaseElement,
} from '../../db-actions.ts';

import {
  DaoMember as DAOMember,
  DaoProposal as DAOProposal,
  DaoCalldataObject as DaoCalldataObject,
  DaoMonthActivity as DaoMonthActivity,
  Notification as Notification,
  NotificationSettings as NotificationSettings,
  VoteOption as VoteOption,
  VoiceChatActivity as VoiceChatActivity,
  DaoProposalComment as DaoProposalComment,
} from '../graphql/TypeScriptTypes.ts';

export const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    daoMembers: {
      type: new GraphQLList(daoMemberType),
      async resolve() {
        const { data, error } = await getDatabaseElements<DAOMember>('dao_members');
        if (error) throw new Error(error);
        return data;
      },
    },
    daoMember: {
      type: daoMemberType,
      args: { userWalletAddress: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<DAOMember>(
          'dao_members',
          'userWalletAddress',
          args.userWalletAddress
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    daoProposals: {
      type: new GraphQLList(daoProposalType),
      async resolve() {
        const { data, error } = await getDatabaseElements<DAOProposal>('dao_proposals');
        if (error) throw new Error(error);
        return data;
      },
    },
    daoProposal: {
      type: daoProposalType,
      args: { proposal_id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<DAOProposal>(
          'dao_proposals',
          'proposal_id',
          args.proposal_id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    daoCalldataObjects: {
      type: new GraphQLList(daoCalldataObjectType),
      async resolve() {
        const { data, error } = await getDatabaseElements<DaoCalldataObject>('dao_calldata_objects');
        if (error) throw new Error(error);
        return data;
      },
    },
    daoCalldataObject: {
      type: daoCalldataObjectType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<DaoCalldataObject>(
          'dao_calldata_objects',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    daoMonthActivities: {
      type: new GraphQLList(daoMonthActivity),
      async resolve() {
        const { data, error } = await getDatabaseElements<DaoMonthActivity>('dao_month_activity');
        if (error) throw new Error(error);
        return data;
      },
    },
    daoMonthActivity: {
      type: daoMonthActivity,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<DaoMonthActivity>(
          'dao_month_activity',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    notifications: {
      type: new GraphQLList(notificationType),
      async resolve() {
        const { data, error } = await getDatabaseElements<Notification>('notifications');
        if (error) throw new Error(error);
        return data;
      },
    },
    notification: {
      type: notificationType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<Notification>(
          'notifications',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    notificationSettingsList: {
      type: new GraphQLList(notificationSettings),
      async resolve() {
        const { data, error } = await getDatabaseElements<NotificationSettings>('notification_settings');
        if (error) throw new Error(error);
        return data;
      },
    },
    notificationSettings: {
      type: notificationSettings,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<NotificationSettings>(
          'notification_settings',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    voteOptions: {
      type: new GraphQLList(voteOptionType),
      async resolve() {
        const { data, error } = await getDatabaseElements<VoteOption>('vote_options');
        if (error) throw new Error(error);
        return data;
      },
    },
    voteOption: {
      type: voteOptionType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<VoteOption>(
          'vote_options',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    voiceChatActivities: {
      type: new GraphQLList(voiceChatActivity),
      async resolve() {
        const { data, error } = await getDatabaseElements<VoiceChatActivity>('voice_chat_participation');
        if (error) throw new Error(error);
        return data;
      },
    },
    voiceChatActivity: {
      type: voiceChatActivity,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<VoiceChatActivity>(
          'voice_chat_participation',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },

    daoProposalComments: {
      type: new GraphQLList(daoProposalCommentType),
      async resolve() {
        const { data, error } = await getDatabaseElements<DaoProposalComment>('dao_voting_comments');
        if (error) throw new Error(error);
        return data;
      },
    },
    daoProposalComment: {
      type: daoProposalCommentType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      async resolve(_, args) {
        const { data, error } = await getDatabaseElement<DaoProposalComment>(
          'dao_voting_comments',
          'id',
          args.id
        );
        if (error) throw new Error(error);
        return data;
      },
    },
  },
});


export const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    // Example mutation for DAO Member insert
    insertDaoMember: {
      type: daoMemberType,
      args: {
        input: { type: new GraphQLNonNull(/* input type for daoMember */ GraphQLString) }, // replace with actual input type
      },
      async resolve(_, { input }) {
        const { data, error } = await insertDatabaseElement<DAOMember>('dao_members', input);
        if (error) throw new Error(error);
        return data;
      },
    },

    updateDaoMember: {
      type: daoMemberType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(/* input type for daoMember */ GraphQLString) },
      },
      async resolve(_, { id, input }) {
        const { data, error } = await updateDatabaseElement<DAOMember>('dao_members', id, input);
        if (error) throw new Error(error);
        return data;
      },
    },

    deleteDaoMember: {
      type: daoMemberType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, { id }) {
        const { data, error } = await deleteDatabaseElement<DAOMember>('dao_members', id);
        if (error) throw new Error(error);
        return data;
      },
    },

    insertDaoProposal: {
      type: daoProposalType,
      args: {
        input: { type: new GraphQLNonNull(GraphQLString) }, 
      },
      async resolve(_, { input }) {
        const { data, error } = await insertDatabaseElement<DAOProposal>('dao_proposals', input);
        if (error) throw new Error(error);
        return data;
      },
    },

updateDaoProposal:{
       type: daoProposalType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(/* input type for daoMember */ GraphQLString) },
      },
      async resolve(_, { id, input }) {
        const { data, error } = await updateDatabaseElement<DAOProposal>('dao_members', id, input);
        if (error) throw new Error(error);
        return data;
      },
},

deleteDaoProposal: {
      type: daoProposalType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(_, { id }) {
        const { data, error } = await deleteDatabaseElement<DAOProposal>('dao_members', id);
        if (error) throw new Error(error);
        return data;
      },
    },


  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});