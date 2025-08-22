// import needed functions from fs/promises
// import needed function from path

const createFileWithMessage = async (message) => {
    try {
        // FORMAT DIRECTORY NAME (yyyy-mm-dd)
        //  get current time as new Date object

        // format year

        // format month

        // format day

        // create string for directory name as year-month-day
        const dirName = '';

        // create string for file name (hh-mm-ss.txt)
        const fileName = '';
        // try to open directory that matches dirName
        // HINT: If you try to open a directory that doesn't exist it throws an error. You can nest try/catch blocks

        // if the directory doesn't exist, create  it

        // join the dirName and fileName to create the path

        // create a new file, or add to end of existing file

        console.log(`Successfully created ${fileName}`);
    } catch (error) {
        console.error(error);
    }
};

const deleteFileByName = async (filePath) => {
    try {
        // try to delete the file

        console.log(`Successfully deleted ${filePath}`);
    } catch (error) {
        console.error('File not found.');
    }
};

// store command input: "create" or "delete"

// store argument input: "<message>" or "<file_name>"

// if command is create AND there is a message, call createFileWithMessage

// else if command is delete AND there is a message, call deleteFileByName

// if improper usage, log the error, and remind of proper usage
console.error(
    'Invalid command or missing argument. Usage "create <message>" or "delete <file_name>"'
);
