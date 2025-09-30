export interface DaoProposal {
  proposal_id: string;
  created_at: string;
  expires_at: string;
  proposal_delay: number;
  proposer_id: string;
  proposal_description: string;
  proposal_title: string;
  isCustom: boolean;
}

export interface DaoMember {
  userWalletAddress: string;
  created_at: string;
  discord_member_id: number;
  nickname: string;
  isAdmin: boolean;
  photoURL: string;
  dao_proposals?: DaoProposal[];
}

export interface DaoCalldataObject {
  id: string;
  proposal_id: string;
  method_signature: string;
  target_address: string;
  value: number;
  addressParameter: string;
  amountParameter: number;
  isFunctionRewarding: boolean;
  isFunctionPunishing: boolean;
  functionDisplayName: string;
}

export interface DaoProposalComment {
  id: number;
  proposal_id: string;
  user_wallet_id: string;
  message: string;
  created_at: string;
}

export interface DaoMonthActivity {
  id: string;
  reward_month: string;
  daily_sent_reports: number;
  general_chat_messages: number;
  crypto_discussion_messages: number;
  resource_share: number;
  member_id: number;
  votings_participated: number;
  proposals_accepted: number;
  proposals_created: number;
  problems_solved: number;
}

export interface Notification {
  id: number;
  createdAt: string;
  receivedAt: string;
  isRead: boolean;
  directedUser: string;
  message: string;
  unvotedProposalId: string;
}

export interface VoteOption {
  id: string;
  proposal_id: string;
  calldata_indices: number[];
  voteOptionIndex: number;
  isExecuting: boolean;
  isDefeating: boolean;
  voting_option_text: string;
}

export interface NotificationSettings {
  id: number;
  userWalletAddress: string;
  notifyOnNewProposals: boolean;
  notifyOnExecution: boolean;
  notifyOnVote: boolean;
  notifyOnUnvoted: boolean;
  updateAt: string;
  endpoint: string;
  auth_key: string;
  p256h_key: string;
  notifyOnCancel: boolean;
  notifyOnSuccess: boolean;
}

export interface VoiceChatActivity {
  id: string;
  created_at: string;
  message: string;
  member_id: number;
  voice_chat_id: string;
  minutes_spent: number;
  minutes_mic_on: number;
  is_stage: boolean;
  chat_timestamp: string;
}
