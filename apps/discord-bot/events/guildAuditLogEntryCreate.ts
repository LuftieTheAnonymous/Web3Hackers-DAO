import { GuildAuditLogsEntry } from "discord.js";

module.exports={
    name:'guildAuditLogEntryCreate',
    async execute(auditLogEntry:GuildAuditLogsEntry){
        console.log(auditLogEntry);
    }
}