import { SyncOutlined } from '@hankliu/icons';
import classNames from 'classnames';
import type { CSSProperties, ReactElement } from 'react';
import { Waypoint } from 'react-waypoint';

export interface LoadMoreProps extends Waypoint.WaypointProps {
  visible?: boolean;
  indicator?: ReactElement;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onEnter?: (e: any) => void;
}

function DefaultLoadMoreIndicator() {
  return (
    <div className="flex justify-center">
      <SyncOutlined spin className="h-[1.125rem] text-lg leading-[1] text-[#1677ff]" />
    </div>
  );
}

function LoadMore({
  className,
  style,
  visible = true,
  disabled = false,
  indicator = <DefaultLoadMoreIndicator />,
  onEnter,
  ...rest
}: LoadMoreProps) {
  const handleEnter = (e: any) => {
    if (disabled) return;
    if (onEnter) {
      onEnter(e);
    }
  };
  if (!visible) return null;
  return (
    <div className={classNames('py-3 text-center', className)} style={style}>
      {disabled ? null : <Waypoint {...rest} onEnter={handleEnter} />}
      {indicator}
    </div>
  );
}

export default LoadMore;
