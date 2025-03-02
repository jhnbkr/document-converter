import { parseBoolean } from '@common/utils';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { DocumentTransformerOptions } from '../transformer/interfaces';

export class DocumentConvertOptionsDto
  implements Partial<DocumentTransformerOptions>
{
  @IsOptional()
  @IsString()
  elementSeparator?: string;

  @IsOptional()
  @IsString()
  segmentSeparator?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined ? undefined : parseBoolean(value),
  )
  format?: boolean;
}
