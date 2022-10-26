import { getInput } from '@actions/core';

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

const body = `This is from an action!!`;


const myToken = getInput('repo-token', { required: true });
const octokit = getOctokit(myToken);
const pullRequest = await getPullRequest(context, octokit);

await octokit.rest.issues.createComment({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: pullRequest.number,
  body,
});