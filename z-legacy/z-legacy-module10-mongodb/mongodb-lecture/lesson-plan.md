# MongoDB

## Go through NoSQL Databases article

## Go through MongoDB [slides](https://docs.google.com/presentation/d/15IWjrCTpSN56i1TkjaJARdldWfVSGFbN1EvdJpIq75g/edit?slide=id.p1#slide=id.p1)

## Mongo Atlas and Mongo Compass

### From Mongo Atlas Article

- From homepage signin/signup with Google
- Create an organization

#### Creating a new project

- Click `Create New Project`
- Name the project
- Invite members
  - You will be the project owner, but this is how you would invite group members to have full read/write access
- Create a cluster
  - Select free tier
  - Name the cluster - can be same as project name or different
  - Provider doesn't matter
  - Region should be default Frankfurt, but double check it
- Connect to Cluster
  - Copy password and save it somewhere dfXSZ1N8raJfDblA
  - Choose Compass, and download it
  - Copy connection string
- Add network access from anywhere

#### Connecting to Mongo Compass

- Click the `+` to add a new connection
- Paste the connection string
- Name here can match Cluster/Project name or be something new
- Choose `Save & Connect`

### Using Mongo Compass

- `+` to add new database
- Can name database something generic, or more specific if you have it in mind
- Collections are like tables, so this should be descriptive

#### Adding data

- Can import JSON or CSV files
  - import JSON exported from Neon
- Can also copy/paste documents
- Or run queries in the MongoDB shell
  - Here is where you could run the queries in `Install MongoDB locally`

#### Updating/deleting data

- Can manually update via the GUI in addition to the shell

## Mongo Compass Checklist

- Installed, and connect to a project
- Copy connection string
- Import/export data
- Manually update a field with GUI
- Bonus
  - Run CRUD queries

## CRUD Operations with Mongo

-
