---
title: 'A quick guide to fix your Git mistakes'
date: '2020-08-04'
---

# Introduction

Git is a wonderful tool. It's the tool that is usually mentioned as the one every developer should have under its belt. However, git is not easy to understand as well. Most of us frequently face a really simple flow, doing commands like `pull, add, commit, push, merge` and in some company flows you will use `rebase`. However, once in a while we screw up.

We know that sometimes ~~shit~~ things happen in your commit history and you might find it easier to create a new branch, doing a revert, or creating a commit like `Fix typo`. Making mistakes in Git is not so uncommon. However, knowing how to fix them is what makes me not bother when things like that happen. If you don't know the tools git provides to you, fixing mistakes can be painful. But if you do know the tools that allow you to fix your mistakes, it's like having a nice cup of coffee on a raining morning. Just delightful.

This post will go through the `interactive rebase` tool to enable you to fix your commits.

## Basic rebase concepts

If you never rebased a branch, I will go through a quick explanation on it and I'll leave this [article](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase)  so you can dig deeper into the subject if suitable for you. The goal here is not to go through the rebase itself, but without a basic understanding, it won't be possible to explain the interactive options. So, let's start with a quick explanation of rebasing.

First, let's assume we have a main branch with the following commit history:

![main](https://dev-to-uploads.s3.amazonaws.com/i/jquud05ytije1220nyyr.png)

From this `main` branch, you create a new one called `button-feature` and started your work while your colleagues kept merging their PR's into the `main` branch. The times where a file was locked until your work is finished are long gone, thankfully. So your branches history will be a beautiful thing, looking like this now:

![new-branch](https://dev-to-uploads.s3.amazonaws.com/i/60aaze4qwhk4tv8l67vh.png)

At some point, you will need to get the updated code from the `main`, right?  Usually, people merge the `main` branch into their development branch. However, you can also `rebase` your branch from the one you created yours from.

To do so, you will update the contents from `main` by pulling the new contents and then, within your `button-feature` branch you would run: `git rebase main`. The result would be close to:

![rebased branches](https://dev-to-uploads.s3.amazonaws.com/i/1ye0rlt295mm7dn7xnfg.png)

When doing so, the rebase command will add your commits on top of the latest commit from `main`. Even though they still have the same content, they're not the same commit anymore. The history of those commits is rewritten now, new commit hashes are assigned to each one of them. That's the reason I've changed the colors of it.

The main advantage here is that it allows the git history to keep a linear structure, making it easier to use operations like [`bisect`](https://git-scm.com/docs/git-bisect) to find issues within the code.

Rewriting history is a powerful tool, and "with great powers, comes great responsibilities". You know that since you were a kid, right? So, be aware.

> Changing commit history can be a problem if you rebase a branch that people branched of from, since the commit hashes won't be the same anymore, not being possible to track down the original changes. A deeper explanation can be seen [here](https://www.atlassian.com/git/tutorials/rewriting-history)

# Interactive rebase to the rescue

It's common for us developers to forget something when doing a commit, to name the commit inconsistently, forgetting to add some piece of code or we simply want to delete a commit we've added.

These things among others can be helped if you know how to do an interactive rebase. I've separated three topics from it that at least in my development workflow are the most common to be used.

## Renaming a commit

In this scenario, I've added a commit with a name that doesn't follow the guideline that I should use.

![gitlog](https://dev-to-uploads.s3.amazonaws.com/i/hcel0g9r6ntqf0l6s3f4.png)

If you take a closer look, you will see that the second commit is not consistent with the latest one, so let's fix that.

First, we do a `git rebase -i HEAD~2`, which means "I want to do the rebase operation on the latest two commits".

After executing that command, you will see the following:
![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/p1avsebfx7o22h8gqcet.png)

The rebase menu already shows you everything you can do. Read through it to see the possibilities if you don't remember from the top of your head. Let's choose the `reword` option, or simply `r`, to rename the commit we want.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/if9eq9fzdk075ghbtiej.png)

Every time you see this screen, to execute the operation, you will need to save and close the file. When doing so, the rebase process starts and the commit prompt is showed to me.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/77zih26rk1m3ugueg67m.png)

Here I can change the text to whatever I want.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/kyqf79m7uth4vzof5htc.png)

The new commit message is assigned to that commit I had. If I take a look into the log again, we'll see an updated message.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/at7bmd276hbauenm2gow.png)

## Dropping a commit

This one is for those cases you just want to test something and keep in your change history, but you want to delete later. You could stash, apply the stash later, but you can also simply commit it and later just delete it. I use this a lot when I have to do some tests, especially if I want the change to go through the pipeline. After testing everything I wanted, I can just delete the commit.

Assume that I have a commit called `Remove this commit` that I will delete it in the future as we can see in the following image.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/k18hycf1p6l672ec4muo.png)

We can do a `git rebase -i HEAD~`, which means we want to rebase the last commit.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/myleyljve2iwpvyo6jr2.png)

Now you would just replace the `pick` word with `d` for `drop`, after doing so, your commit should be long gone.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/ku14xcso8o2c0ig3rm3h.png)

## Editing a commit

If you ever had to face a commit where you forgot to add a piece of code,  or only after committing you saw a broken test (yeah, we know it's not always we do TDD). This is the tool to help you fix it.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/7nripdzgo72owggao78v.png)

The commit `Add message file` contains a space that it shouldn't. You can see it in the green line with a `console.log(' message')`.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/37qtyc0chr3x5dq0xtav.png)

How to fix this issue without creating a new commit? Let's make the magic happen. First, we will rebase to the point we want. So, let's do a `git rebase -i HEAD~2` to rebase the latest two commits.

Now, we will pick the option `e` to `edit` the commit.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/fawl3208ahsqnoazzj4i.png)

This is what you will see when saving the file and closing the editor:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/rwsmdipu6uiz4ay00lx3.png)

Now we can edit the code:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/o00vgq715emekoohuizz.png)

After this change, we can add the fix in the same commit using `git commit --amend`. This will open the commit prompt for the commit you wanted to edit.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/amqyrxk24ojjn3gspc4p.png)

You can simply save it and close the editor. If there's nothing else to be done, after running a `git rebase --continue` the operation will be done and your commit will be fixed :)

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/gikxna4ce58z4bibzsbk.png)


## Dealing with remote

If you do a rebase after your contents are already on remote (you pushed the contents), you will have to do force the push, since the history changed.

To do so, the best idea is to use `git push --force-with-lease`, since this command will check if no other new content was added to the branch by someone else :)

# References
- You can learn a lot on Git from [Atlassian tutorials](https://www.atlassian.com/git/tutorials/learn-git-with-bitbucket-cloud)
- [Git manuals](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) can be helpful.
- The most recommended book I've seen on Git is the [Pro Git](https://git-scm.com/book/en/v2)

# Acknowledgments

Thanks again, Martin Fieber. You've helped my growth a lot in the past year with your inputs. Especially reviewing my writings and giving great suggestions. :)
