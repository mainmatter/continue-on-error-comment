import { getInput, setFailed } from '@actions/core';

import { getOctokit, context } from '@actions/github';

export async function getPullRequest(context, octokit) {
  const pr = context.payload.pull_request;

  if (!pr) {
    console.log('Could not get pull request number from context, exiting');
    return;
  }

  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner: pr.base.repo.owner.login,
    repo: pr.base.repo.name,
    pull_number: pr.number,
  });

  return pullRequest;
}

try {
  const myToken = getInput('repo-token', { required: true });
  const exitCode = getInput('exit-code', { required: true });
  const outcome = getInput('outcome', { required: true });

  const body = `This is from an action!!

Your exit_code is: ${exitCode}
Your outcome is: ${outcome}`;

  const octokit = getOctokit(myToken);
  const pullRequest = await getPullRequest(context, octokit);

  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pullRequest.number,
    body,
  });
} catch (error) {
  setFailed(error.message);
}