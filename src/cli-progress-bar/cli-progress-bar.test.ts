import { SingleBar } from 'cli-progress';

describe('CLI Progress', () => {
  afterEach(jest.resetModules);

  it('allows you to instantiate a cli progress instance', async () => {
    const { cliProgressBar } = await import('./cli-progress-bar');

    const progressInstance = cliProgressBar.instantiateInstance();

    // eslint-disable-next-line prettier/prettier
    expect(progressInstance instanceof SingleBar).toBeTruthy();
  });

  it('allows you to retrieve a previously instantaited instance', async () => {
    const { cliProgressBar } = await import('./cli-progress-bar');

    const instanceOnInstantiation = cliProgressBar.instantiateInstance();

    const instanceOnGet = cliProgressBar.getInstance();

    expect(instanceOnInstantiation).toBe(instanceOnGet);
  });

  it('will error if you try to instantiate instance twice', async () => {
    const { cliProgressBar } = await import('./cli-progress-bar');

    cliProgressBar.instantiateInstance();

    expect(() => cliProgressBar.instantiateInstance()).toThrowError(
      'CLI progress has already been instantiated',
    );
  });

  it('will error if you try to get uninstantiated instance', async () => {
    const { cliProgressBar } = await import('./cli-progress-bar');

    expect(() => cliProgressBar.getInstance()).toThrowError(
      "CLI progress hasn't been instantiated yet",
    );
  });

  it('will instantiation with custom options', async () => {
    const { cliProgressBar } = await import('./cli-progress-bar');

    const newEtaBufferLength = 9999;

    const cliProgressInstance = cliProgressBar.instantiateInstance({
      etaBuffer: newEtaBufferLength,
    }) as any;

    expect(cliProgressInstance.options.etaBufferLength).toBe(
      newEtaBufferLength,
    );
  });
});
