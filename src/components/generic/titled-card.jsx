import React from 'react';
import { Card } from '@/components/generic/card'

const Style = {
  InternalCard: " space-y-4 px-8 py-4 ",
  Heading: 'text-secondary-foreground '
}


export const TitledCard = ({title, children}) => {

  return (
    <Card className={Style.InternalCard}>
    <h2 className={Style.Heading}> { title }</h2>
      {children}
      </Card>
  );
}

