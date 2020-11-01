import React from 'react';

// eslint-disable-next-line import/no-namespace
import * as ReactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from 'test-utils';

import { fAccounts, fAssets, fRopDAI, fSettings, fTxReceipt } from '@fixtures';
import { getAccounts, store, useSelector } from '@store';
import { IAccount, TUuid } from '@types';

import { DataContext, IDataContext } from '../DataManager';
import useAccounts from './useAccounts';

jest.mock('../Settings', () => {
  return {
    useSettings: () => ({
      addAccountToFavorites: jest.fn(),
      addMultipleAccountsToFavorites: jest.fn()
    })
  };
});

jest.mock('@mycrypto/eth-scan', () => {
  return {
    getTokensBalance: jest.fn().mockImplementation(() =>
      Promise.resolve({
        '0xad6d458402f60fd3bd25163575031acdce07538d': {
          _hex: '0x0e22e84c2c724c00'
        }
      })
    )
  };
});

const getUseDispatchMock = () => {
  const mockDispatch = jest.fn();
  jest.spyOn(ReactRedux, 'useDispatch').mockReturnValue(mockDispatch);
  return mockDispatch;
};

const renderUseAccounts = ({ accounts = [] as IAccount[] } = {}) => {
  const wrapper: React.FC = ({ children }) => (
    <Provider store={store}>
      <DataContext.Provider value={({ accounts, settings: fSettings } as any) as IDataContext}>
        {children}
      </DataContext.Provider>
    </Provider>
  );
  return renderHook(() => useAccounts(), { wrapper });
};

describe('useAccounts', () => {
  it('uses get addressbook from DataContext', () => {
    const { result } = renderUseAccounts({ accounts: fAccounts });
    expect(result.current.accounts).toEqual(fAccounts);
  });

  it('createAccountWithID() triggers create action', () => {
    // const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: [] });
    const uuid = 'dummyuuid' as TUuid;
    result.current.createAccountWithID(uuid, fAccounts[0]);
    waitFor(() => {
      const accounts = useSelector(getAccounts);
      return expect(accounts).toEqual(
        expect.objectContaining({ payload: { ...fAccounts[0], uuid } })
      );
    });
  });

  it('createMultipleAccountsWithIDs() triggers updateMany action', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: [] });
    result.current.createMultipleAccountsWithIDs(fAccounts);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: fAccounts }));
  });

  it('deleteAccount() trigger destroy action', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.deleteAccount(fAccounts[0]);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: fAccounts[0].uuid })
    );
  });

  it('updateAccount() triggers update action', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.updateAccount(fAccounts[0].uuid, fAccounts[0]);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: fAccounts[0] }));
  });

  it('addTxToAccount() updates account with tx', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.addTxToAccount(fAccounts[0], fTxReceipt);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          ...fAccounts[0],
          transactions: [fTxReceipt]
        }
      })
    );
  });

  it('removeTxFromAccount() updates account to remove tx', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({
      accounts: [{ ...fAccounts[0], transactions: [fTxReceipt] }]
    });
    result.current.removeTxFromAccount(fAccounts[0], fTxReceipt);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          ...fAccounts[0],
          transactions: []
        }
      })
    );
  });

  it('getAccountByAddressAndNetworkName() updates account with tx', () => {
    const { result } = renderUseAccounts({ accounts: fAccounts });
    const account = result.current.getAccountByAddressAndNetworkName(
      fAccounts[0].address,
      fAccounts[0].networkId
    );
    expect(account).toBe(fAccounts[0]);
  });

  it('updateAccountAssets()', async () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.updateAccountAssets(fAccounts[1], fAssets);
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            ...fAccounts[1],
            assets: [
              expect.objectContaining({
                uuid: fRopDAI.uuid,
                balance: '1018631879600000000'
              }),
              ...fAccounts[1].assets
            ]
          }
        })
      )
    );
  });

  it('updateAllAccountsAssets()', async () => {
    const mockDispatch = getUseDispatchMock();
    const accounts = [fAccounts[1], { ...fAccounts[2], assets: [] }];
    const { result } = renderUseAccounts({ accounts });
    result.current.updateAllAccountsAssets(accounts, fAssets);
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: accounts.map((a) => ({
            ...a,
            assets: [
              expect.objectContaining({
                uuid: fRopDAI.uuid,
                balance: '1018631879600000000'
              }),
              ...a.assets
            ]
          }))
        })
      )
    );
  });

  it('updateAccounts() calls updateAll with merged list', async () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.updateAccounts(fAccounts.slice(0, 3));
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: fAccounts }))
    );
  });

  it('toggleAccountPrivacy() updates account with isPrivate', () => {
    const mockDispatch = getUseDispatchMock();
    const { result } = renderUseAccounts({ accounts: fAccounts });
    result.current.toggleAccountPrivacy(fAccounts[0].uuid);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          ...fAccounts[0],
          isPrivate: true
        }
      })
    );
  });
});
