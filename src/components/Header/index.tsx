import classNames from 'classnames';
import React from 'react';

import { PageTitle } from '@/constants';

export interface IHeaderProps {
  className?: string;
}

/**
 * 网页头部
 */
export default function Header({ className }: IHeaderProps) {
  return (
    <header
      className={classNames(
        'group relative flex h-[520px] items-center justify-center overflow-hidden',
        {
          [className]: className,
        },
      )}
    >
      {/* 背景 */}
      <div className="absolute inset-0 -bottom-[20px] -left-[20px] -right-[20px] -top-[20px] z-0 bg-black blur-[3px] contrast-[10]">
        {/* 标题 */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
          <h1 className="toolkits-title group/title select-none text-center tracking-tight ">
            <span
              className={classNames(
                'relative m-auto inline-block skew-y-3 border-0 border-b-[10px] border-solid border-b-white text-center text-[100px] leading-[0.85] text-white',
                "before:absolute before:-bottom-[20px] before:left-0 before:h-[20px] before:w-[10px] before:translate-x-0 before:translate-y-0 before:animate-[move_7.5s_ease-in-out_infinite] before:rounded-[50%] before:bg-white before:content-['']",
                "after:absolute after:-bottom-[20px] after:left-0 after:h-[20px] after:w-[10px] after:translate-x-0 after:translate-y-0 after:animate-[move_7.5s_ease-in-out_1s_infinite] after:rounded-[50%] after:bg-white after:content-['']",
              )}
            >
              {PageTitle}
            </span>
          </h1>
        </div>
      </div>
    </header>
  );
}
