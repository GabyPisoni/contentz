const { join, parse } = require("path");
const execa = require("execa");

const { version } = require("../package.json");
const { writeFile, makeDir } = require("./lib/fs");

const gitIgnore = `/node_modules
/logs
/public
/.cache
/.tmp
*.log
.DS_Store`;

const pkg = (name, version) =>
  JSON.stringify(
    {
      name,
      description: "Just another Contentz site",
      scripts: {
        build: "contentz build",
        social: "contentz social",
        write: "contentz write",
        watch: 'watch "yarn build" articles pages',
        dev: 'concurrently "yarn watch" "yarn start"',
        start: "serve public -p 3000"
      },
      keywords: ["contentz", "website"],
      private: true,
      dependencies: {
        contentz: version
      },
      devDependencies: {
        concurrently: "4.1.0",
        husky: "1.3.1",
        "lint-staged": "8.1.5",
        serve: "10.1.2",
        watch: "1.0.2"
      },
      husky: {
        hooks: {
          "pre-commit": "lint-staged"
        }
      },
      "lint-staged": {
        "*.mdx": ["yarn social", "git add"]
      }
    },
    null,
    2
  );

const readme = `# Contentz

This is your Contentz website, you could create your first article using the \`yarn write\` command.

While writing, run \`yarn dev\` to concurrently run \`yarn watch\` and \`yarn start\`.

The \`watch\` command will run \`yarn build\` every time an article or page changes.
`;

const config = name => `---
title: ${name}
description: Just another Contentz site
language: en
incremental: false # Change to \`true\` if your server support keeping \`.cache\` and \`public\` folders
`;

async function main([name = null]) {
  const cwd = name ? join(process.cwd(), name) : process.cwd();
  console.log("Initializing new project on %s", cwd);
  
  try {
    cwd !== process.cwd() && (await makeDir(cwd));

    console.log("Writing files to disk...");
    await Promise.all([
      writeFile(join(cwd, ".gitignore"), gitIgnore, "utf8"),
      writeFile(
        join(cwd, "package.json"),
        pkg(parse(cwd).name, version),
        "utf8"
      ),
      writeFile(join(cwd, "README.md"), readme, "utf8"),
      writeFile(join(cwd, "config.yml"), config(parse(cwd).name), "utf8")
    ]);

    console.log("Installing dependencies (it could take a few minutes)...");
    await execa.shell(`cd ${cwd} && yarn install ; cd -`);
    console.log("Building website for the first time...");
    await execa.shell(`cd ${cwd} && yarn build ; cd -`);
  } finally {
    console.log("Your project on %s has been successfully initialized.", cwd);
    console.log("Move with `cd %s`", cwd);
    console.log("Write your first article using `yarn write` command.");
    console.log("And start working with `yarn dev` command");
  }
}

module.exports = main;
