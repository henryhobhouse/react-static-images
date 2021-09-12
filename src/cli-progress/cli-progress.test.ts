/* eslint-disable import/no-namespace */
import * as cliProgressModule from 'cli-progress';

describe('CLI Progress', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('allows you to instantiate a cli progress instance', async () => {
    const { cliProgressBar } = await import('./cli-progress');

    const progressInstance = cliProgressBar.instantiateInstance();

    // eslint-disable-next-line prettier/prettier
    expect(
      progressInstance instanceof cliProgressModule.SingleBar,
    ).toBeTruthy();
  });

  it('allows you to retrieve a previously instantaited instance', async () => {
    const { cliProgressBar } = await import('./cli-progress');

    const instanceOnInstantiation = cliProgressBar.instantiateInstance();

    const instanceOnGet = cliProgressBar.getInstance();

    expect(instanceOnInstantiation).toBe(instanceOnGet);
  });

  it('will error if you try to instantiate instance twice', async () => {
    const { cliProgressBar } = await import('./cli-progress');

    cliProgressBar.instantiateInstance();

    expect(() => cliProgressBar.instantiateInstance()).toThrowError(
      'CLI progress has already been instantiated',
    );
  });

  it('will error if you try to get uninstantiated instance', async () => {
    const { cliProgressBar } = await import('./cli-progress');

    expect(() => cliProgressBar.getInstance()).toThrowError(
      "CLI progress hasn't been instantiated yet",
    );
  });

  it('will instantiation with custom options', async () => {
    const { cliProgressBar } = await import('./cli-progress');

    const newEtaBufferLength = 9999;

    const cliProgressInstance = cliProgressBar.instantiateInstance({
      etaBuffer: newEtaBufferLength,
    }) as any;

    expect(cliProgressInstance.options.etaBufferLength).toBe(
      newEtaBufferLength,
    );
  });
});