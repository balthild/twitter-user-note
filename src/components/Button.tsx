import styled from '@emotion/styled';

export const Button = styled.button`
    height: 2.25em;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5em;
    font-size: inherit;
    font-family: inherit;
    border: none;
    border-radius: 0.2em;
    background: light-dark(#eff1f5, rgb(255 255 255 / 15%));
    color: inherit;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
        background: light-dark(#e0e4eb, rgb(255 255 255 / 20%));
    }

    &:disabled {
        opacity: 0.5;
    }

    &.primary {
        background: #1d9bf0;
        color: #ffffff;

        &:hover {
            background: #1a8cd8;
        }
    }
`;
