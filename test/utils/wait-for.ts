export const waitFor = async (
  assertion: VoidFunction,
  pollInterval = 10,
  timeOut = 3000,
) => {
  let timeRun = 0;

  return new Promise((resolve, reject) => {
    async function checkCondition() {
      try {
        await assertion();
        resolve(true);
      } catch (exception) {
        if (timeRun <= timeOut) {
          timeRun += pollInterval;
          setTimeout(checkCondition, pollInterval);
        } else {
          reject(exception);
        }
      }
    }

    checkCondition();
  });
};
