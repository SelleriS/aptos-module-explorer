import { WalletType } from '@horizonx/aptos-wallet-connector'
import Image from 'next/image'
import { FC, forwardRef, InputHTMLAttributes, useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { CHAIN_INFO, WALLET_INFO } from 'src/constants'
import { useSettings } from 'src/hooks/useSettings'
import { useWallet } from 'src/hooks/useWallet'
import {
  darkGrey,
  jetBlack,
  smokyBlack,
  tiffany,
  trueBlack,
} from 'src/styles/colors'
import {
  fontFamilyHeading,
  fontWeightBold,
  fontWeightMedium,
} from 'src/styles/fonts'
import { getNodeUrls } from 'src/utils/chain'
import styled from 'styled-components'
import { WalletButton } from './parts/Button'
import { InputWithDatalist, InputWithDatalistProps } from './parts/Input'
import { InvalidChainWarning } from './parts/Message'

type SettingsFormData = Partial<{
  chainId: number
  account: string
  nodeUrl: string
}>

export const Settings: FC = () => {
  const { account, chainId, signer, connect } = useWallet()
  const { values, updateValues } = useSettings()

  const nodeUrls = getNodeUrls(chainId)
  const methods = useForm<SettingsFormData>()

  const update = useCallback(
    (key: keyof SettingsFormData) => {
      updateValues({ [key]: methods.getValues(key) })
      methods.setValue(key, '')
    },
    [methods, updateValues],
  )

  return (
    <Section>
      <FormProvider {...methods}>
        <div>
          <span>Signer</span>
          {account && (
            <code>
              {account}
              {toChainIdDisplay(chainId)}
            </code>
          )}
          {values.chainId && chainId && values.chainId != chainId && (
            <InvalidChainWarning chainId={values.chainId} />
          )}
          <WalletsDiv>
            {Object.keys(WALLET_INFO).map((key) => {
              const { imageSrc, label } = WALLET_INFO[key as WalletType]
              return (
                <WalletButton
                  key={key}
                  onClick={async () => connect(key as WalletType)}
                  disabled={signer?.type === key}
                >
                  <Image src={imageSrc} alt={label} width={24} height={24} />
                  {label}
                </WalletButton>
              )
            })}
          </WalletsDiv>
        </div>
        <SettingsItem
          label="Chain ID"
          current={toChainIdDisplay(values.chainId)}
          datalist={{
            listId: 'chain-ids',
            options: Object.keys(CHAIN_INFO).map((chainId) => ({
              value: chainId,
              label: `${CHAIN_INFO[+chainId].name} (ChainId: ${chainId})`,
            })),
          }}
          onClick={() => update('chainId')}
          {...methods.register('chainId', {
            setValueAs: (val) =>
              !val || Number.isNaN(+val) ? undefined : +val,
          })}
        />
        <SettingsItem
          label="Account"
          current={values.account}
          buttonLabel="Load"
          disabled={!values.chainId && !values.nodeUrl && !chainId}
          onClick={() => update('account')}
          {...methods.register('account')}
        />
        <SettingsItem
          label="Node URL (Optional)"
          datalist={{ listId: 'node-urls', options: nodeUrls }}
          current={values.nodeUrl}
          onClick={() => update('nodeUrl')}
          {...methods.register('nodeUrl')}
        />
      </FormProvider>
    </Section>
  )
}

const toChainIdDisplay = (chainId: number | undefined) =>
  chainId != null
    ? `\nChain ID: ${chainId} (${CHAIN_INFO[chainId]?.name || 'Unknown'})`
    : undefined

type SettingsItemProps = {
  label: string
  current?: string
  onClick: VoidFunction
  disabled?: boolean
  buttonLabel?: string
  datalist?: InputWithDatalistProps
}
const SettingsItem = forwardRef<
  HTMLInputElement,
  SettingsItemProps & InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      label,
      current,
      buttonLabel = 'Apply',
      disabled,
      onClick,
      datalist,
      ...props
    },
    ref,
  ) => (
    <label>
      <span>{label}</span>
      {current && <code>{current}</code>}
      <InputDiv>
        {datalist ? (
          <InputWithDatalist {...props} {...datalist} ref={ref} />
        ) : (
          <input {...props} ref={ref} />
        )}
        <button disabled={disabled} onClick={onClick}>
          {buttonLabel}
        </button>
      </InputDiv>
    </label>
  ),
)

const WalletsDiv = styled.div``

const InputDiv = styled.div`
  padding: 12px;
  border-radius: 6px;
  background: ${smokyBlack};
  input {
    flex: 1;
  }
  button {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: ${fontWeightMedium};
    background: ${darkGrey};
    :disabled {
      opacity: 0.5;
    }
    transition: background, color, 0.2s ease-in-out;
    :enabled:hover,
    :enabled:focus {
      background: ${tiffany};
      color: ${jetBlack};
    }
  }
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: 52px;
  label,
  > div {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    span {
      font-size: 20px;
      font-family: ${fontFamilyHeading};
      font-weight: ${fontWeightBold};
    }
    div {
      display: flex;
      align-items: center;
      column-gap: 8px;
    }
  }
  ${WalletsDiv} {
    margin-top: 8px;
  }
  code {
    padding: 12px 16px;
    background: ${trueBlack};
    font-size: 14px;
    white-space: pre-wrap;
  }
`
