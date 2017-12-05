#!/usr/bin/env node

'use strict';

const fs = require('fs');
const co = require('co');
const sjcl = require('sjcl');
const chalk = require('chalk');
const prompt = require('co-prompt');
const program = require('commander');

const encrypt = () => {
  co(function *() {
    let data = yield prompt(chalk.yellow('Enter data: '));
    let password = yield prompt.password(chalk.yellow('Enter password: '));
    let confirmPassword = yield prompt.password(chalk.yellow('Confirm password: '));

    if (password !== confirmPassword) {
      console.error(chalk.red('\nPasswords do not match. Please try again.'));
      process.exit(1);
    }

    const encryptedData = sjcl.encrypt(password, data);
    const decryptedData = sjcl.decrypt(password, encryptedData);

    if (data !== decryptedData) {
      console.error(chalk.red('\nThere we an error encrypting the data. Please try again'));
      process.exit(1);
    }
    console.log(chalk.green('Encrypted data:\n\t\t %s'), encryptedData);
  })
}

const decrypt = () => {
  co(function *() {
    let encryptedData = yield prompt(chalk.yellow('Enter encrypted data: '));
    let password = yield prompt.password(chalk.yellow('Enter password: '));
    
    let decryptedData;

    try {
      decryptedData = sjcl.decrypt(password, encryptedData);
    } catch(error) {
      console.error(chalk.red('\nIncorrect password. Please try again.'));
      process.exit(1);
    }

    console.log(chalk.green('Decrypted data:\n\t\t %s'), decryptedData);
  })
}

const enc = () => {
  let password = process.argv[3];
  let infile = process.argv[4];
  let outfile = process.argv[5];
  let decryptedData;

  if (!password || !infile || !outfile)
  {
    console.error("\nInvalid parameters.");
    process.exit(1);
  }

  console.log(`Reading ${infile}...`);
  let encryptedData = fs.readFileSync(infile, 'utf8');

  try {
    decryptedData = sjcl.encrypt(password, encryptedData);
  } catch(error) {
    console.error(chalk.red('\nIncorrect password. Please try again.'));
    process.exit(1);
  }

  fs.writeFileSync(outfile, decryptedData);

  console.log(`Data encrypted to ${outfile}`);
}

const dec = () => {
  let password = process.argv[3];
  let infile = process.argv[4];
  let outfile = process.argv[5];
  let decryptedData;

  if (!password || !infile || !outfile)
  {
    console.error("\nInvalid parameters.");
    process.exit(1);
  }

  console.log(`Reading JSON from ${infile}...`);
  let encryptedData = fs.readFileSync(infile, 'utf8');

  try {
    decryptedData = sjcl.decrypt(password, encryptedData);
  } catch(error) {
    console.error(chalk.red(`\nDecryption error: ${error}`));
    console.error(chalk.red(`Password may be incorrect!`));
    process.exit(1);
  }

  fs.writeFileSync(outfile, decryptedData);

  console.log(`Data decrypted to ${outfile}`);
}

program.command('encrypt')
       .description('encrypt raw data')

program.command('decrypt')
       .description('decrypt SJCL encrypted data')

program.command('enc [pwd] [infile] [outfile]')
       .description('encrypt source file to destination file')

program.command('dec [pwd] [infile] [outfile]')
       .description('decrypt SJCL encrypted file to destination file')

program.on('encrypt', () => { encrypt() })
       .on('decrypt', () => { decrypt() })
       .on('enc', () => { enc() })
       .on('dec', () => { dec() })
       .on('*', () => { program.help() });

program.parse(process.argv);
