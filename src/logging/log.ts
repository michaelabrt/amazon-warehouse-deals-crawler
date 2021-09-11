import chalk from 'chalk';

type identationLevels = '0' | '1' | '2' | '3';

const spacer = '  ';

const indent = (s: string, n: identationLevels) => {
  switch (n) {
    case '0':
      return s;
    case '1':
      return spacer + s;
    case '2':
      return spacer + spacer + s;
    case '3':
      return spacer + spacer + spacer + s;
  }
};

const log = {
  banner: (s: string, i: identationLevels = '0') => console.log(chalk.black.bgBlueBright(indent(s, i))),
  success: (s: string, i: identationLevels = '0') => console.log(chalk.green(indent(s, i))),
  info: (s: string, i: identationLevels = '0') => console.log(indent(s, i)),
  warn: (s: string, i: identationLevels = '0') => console.log(chalk.keyword('orange')(indent(s, i))),
  error: (s: string, i: identationLevels = '0') => console.log(chalk.red(indent(s, i))),
  debug: (s: string, i: identationLevels = '0') => console.log(chalk.grey(indent(s, i))),
};

export default log;
