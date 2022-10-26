import { getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';

import getPullRequest from './lib/get-pull-request.js';

import { signiture } from './lib/constants.js';

try {
  const myToken = getInput('repo-token', { required: true });
  const outcome = getInput('outcome', { required: true });
  const testId = getInput('test-id', { required: true });

  if (outcome === 'failure') {
    const octokit = getOctokit(myToken);
    const pullRequest = await getPullRequest(context, octokit);
  
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pullRequest.number,
    });

    const existingComment = comments.find((comment) => comment.user.login === 'github-actions[bot]' && comment.body.endsWith(signiture) && comment.body.includes(`sha: ${context.sha}`));
  
    if (existingComment) {

      let body = existingComment.body.split('\n');

      body.splice(body.length - 3, 0, `- ${testId}`);

      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existingComment.id,
        body: body.join('\n'),
      });
    } else {
      const body = `Some tests with 'continue-on-error: true' have failed: 
  
- ${testId}

sha: ${context.sha}
${signiture}`;
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
        body,
      });
    }
  }

} catch (error) {
  setFailed(error.message);
}