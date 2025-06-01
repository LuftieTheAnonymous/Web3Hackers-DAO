const http = require('http');
import cors from "cors";
import express from 'express';
import { activateProposalsJob, executeProposalsJob, finishProposalsJob, queueProposalsJob } from './jobs/governor/proposalJobs';
import { monthlyContributionJob } from './jobs/token/governanceTokenJobs';

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);


server.listen(2138, () => {

    console.log('Server is running on port 2138');

    activateProposalsJob.start();
    finishProposalsJob.start();
    queueProposalsJob.start();
    executeProposalsJob.start();
    monthlyContributionJob.start();
});


