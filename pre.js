import { getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';

import getPullRequest from './lib/get-pull-request.js';

import { signiture } from './lib/constants.js';

try {
  const myToken = getInput('repo-token', { required: true });

  const octokit = getOctokit(myToken);
  const pullRequest = await getPullRequest(context, octokit);

  const { data: comments } = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequest.number,
  });

  
  const oldComments = comments.filter((comment) => comment.user.login === 'github-actions[bot]' && comment.body.endsWith(signiture) && !comment.body.includes(`runId: ${context.runId}`));
  if(oldComments.length){
    const promises = oldComments.map(oldComment=>octokit.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: oldComment.id,
    }));

    await Promise.all(promises);
  }
  
} catch (error) {
  setFailed(error.message);
}