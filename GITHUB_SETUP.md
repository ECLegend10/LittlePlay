# Put Little Play on GitHub

This folder contains the Little Play project source. Its current hosting configuration is for the existing ChatGPT Site; a GitHub repository is source control and does not automatically change that Site or deploy it elsewhere.

## Create the private repository

1. On GitHub, choose **New repository**.
2. Set the repository name to `little-play` and choose **Private**.
3. Leave **Add a README**, `.gitignore`, and license unchecked so the repository starts empty.
4. Create the repository.

## Push this folder

Open a terminal in this folder and run:

```sh
git init
git add .
git commit -m "Initial Little Play source"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/little-play.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. GitHub will prompt you to authenticate if needed.

The `.gitignore` excludes local dependencies, build output, and `.env` files. Keep API keys and other secrets out of GitHub, including private repositories.
