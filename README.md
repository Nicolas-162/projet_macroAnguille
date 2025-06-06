# Readme

Here's the readme for the project « Macro Anguilles ».

## Installation

First you need to install a few tools:

-   Xampp: it contains the Apache server (Web) and the MySQL server.
-   HeidiSQL: a database manager, great because of the ability to import large database from a script which can be tricky with PHPMyAdmin.
-   NodeJS: it is a React project how can you build such a project without it 😅

## Requirements

### Database import

You need to import the database with HeidiSQL. The script to execute is located in the « requirements » folder.

### PHP

In the « php » folder you'll find all the scripts used. You want to move it in the « htdocs » folder located in the folder where Xampp is installed.
The « Gestion_turbinage » folder should also be placed in htdocs.

### Run the project

To run the project you need to type the following commands:

```bash
git clone https://github.com/Nicolas-162/projet_macroAnguille.git
cd projet_macroAnguille
npm install #install all the packages needed
npm run dev
```

### Build the project

-   Build the project

```bash
npm run build
```

The built project will be by default placed in the the « dist » folder.

-   Create a new folder in the « htdocs » directory. The folder must have the same name as the React project otherwise it won't run.
-   Place the content of « dist » folder in the newly created folder in htdocs.

## Demo

Open any browser and go to this link: http://localhost/macroAnguille

## Useful links

-   [Xampp](https://www.apachefriends.org/fr/index.html)
-   [NodeJS](https://nodejs.org/)
-   [React](https://react.dev/)

## Authors

-   [@nicolas-162](https://www.github.com/Nicolas-162)
