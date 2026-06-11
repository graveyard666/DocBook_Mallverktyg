import { parseDocBookXml } from '../lib/parser';
import type { DocBookDocument } from '../types/docbook';

const bookedAppointmentNoButtons = `<?xml version="1.0"?>
<article>
  <section>
    <title>Välkommen till Söderby Vårdcentral</title>
    <para>Vi har bokat tid till dig hos Anton Andersson, läkare, för undersökning.</para>
  </section>
  <section>
    <variablelist>
      <varlistentry>
        <term>Datum:</term>
        <listitem>Tisdag 10 mars 2022</listitem>
      </varlistentry>
      <varlistentry>
        <term>Klockan:</term>
        <listitem>11.00</listitem>
      </varlistentry>
      <varlistentry>
        <term>Plats:</term>
        <listitem>Sandstigen 15, Söderby Våningsplan 5</listitem>
      </varlistentry>
    </variablelist>
    <para><link url="https://www.example.se/" type="_blank">Lägg till i min kalender</link></para>
  </section>
  <section>
    <title>Viktigt inför ditt besök</title>
    <itemizedlist mark="bullet">
      <listitem>Covid-19: För att undvika smittspridning är det viktigt att du stannar hemma även vid lindriga förkylningssymptom.</listitem>
      <listitem>Är du diabetiker? Ta gärna med ett provsvar på blodsockernivå för de senaste 2-3 månaderna.</listitem>
      <listitem>Utför inte kraftig fysisk aktivitet eller tungt arbete innan besöket.</listitem>
      <listitem>Kontakta oss före besöket om du får förhinder.</listitem>
    </itemizedlist>
  </section>
  <section>
    <title>Att tänka på inför besöket</title>
    <itemizedlist mark="hyphen">
      <listitem>Ta med legitimation</listitem>
      <listitem>Betala ditt besök med kort eller Swish</listitem>
      <listitem>Avboka senast 24 timmar före besöket, så slipper du betala avgift.</listitem>
      <listitem>Om du behöver av- eller omboka din tid kontakta mottagningen via telefon: 0721-123 456</listitem>
      <listitem>Mottagningens telefontider är vardagar kl 8:00 - 10:00</listitem>
    </itemizedlist>
  </section>
</article>`;

const bookedAppointmentWithTextBoxes = `<?xml version="1.0"?>
<article>
  <section>
    <title>Välkommen till Söderby Vårdcentral</title>
    <para>Vi har bokat tid till dig hos Anton Andersson, läkare, för undersökning.</para>
  </section>
  <section>
    <variablelist>
      <varlistentry>
        <term>Datum:</term>
        <listitem>Tisdag 10 mars 2022</listitem>
      </varlistentry>
      <varlistentry>
        <term>Klockan:</term>
        <listitem>11.00</listitem>
      </varlistentry>
      <varlistentry>
        <term>Plats:</term>
        <listitem>Sandstigen 15, Söderby Våningsplan 5</listitem>
      </varlistentry>
    </variablelist>
  </section>
  <section>
    <title><emphasis role="information">Viktigt inför ditt besök.</emphasis></title>
    <itemizedlist mark="bullet">
      <listitem>Covid-19: För att undvika smittspridning är det viktigt att du stannar hemma även vid lindriga förkylningssymptom.</listitem>
      <listitem>Är du diabetiker? Ta gärna med ett provsvar på blodsockernivå för de senaste 2-3 månaderna.</listitem>
      <listitem>Utför inte kraftig fysisk aktivitet eller tungt arbete innan besöket.</listitem>
      <listitem>Kontakta oss före besöket om du får förhinder.</listitem>
    </itemizedlist>
  </section>
  <section>
    <title><emphasis role="observe">Tänk på.</emphasis></title>
    <itemizedlist mark="hyphen">
      <listitem>Ta med legitimation.</listitem>
      <listitem>Betala ditt besök med kort eller Swish.</listitem>
      <listitem>Vill du ha en faktura är faktureringsavgiften xx kr.</listitem>
      <listitem>Avboka senast 24 timmar före besöket, så slipper du betala avgift.</listitem>
      <listitem>Om du behöver av- eller omboka din tid kontakta mottagningen via telefon: 0721-123 456</listitem>
      <listitem>Mottagningens telefontider är vardagar kl 8:00 - 10:00</listitem>
    </itemizedlist>
  </section>
  <para><link url="https://www.example.se/" type="_blank">Kontakta Söderby Vårdcentral</link></para>
</article>`;

const cervicalScreening = `<?xml version="1.0"?>
<article>
  <section>
    <title>En tid finns bokad för dig hos en barnmorska.</title>
    <variablelist>
      <varlistentry>
        <term>Tid:</term>
        <listitem>xx månad 20xx, kl xx.xx</listitem>
      </varlistentry>
      <varlistentry>
        <term>Plats:</term>
        <listitem>Grums Vårdcentral, Gamla vägen 89, 664 34 Grums</listitem>
      </varlistentry>
      <varlistentry>
        <term>Telefon:</term>
        <listitem>xx-xxx xx xx</listitem>
      </varlistentry>
      <varlistentry>
        <term>Telefontid:</term>
        <listitem>x.xx-x.xx</listitem>
      </varlistentry>
    </variablelist>
    <para><emphasis role="bold">Besöket är gratis.</emphasis> Väntetid kan uppstå.</para>
  </section>
  <section>
    <title>Boka om din tid om:</title>
    <itemizedlist mark="bullet">
      <listitem>Tiden inte passar</listitem>
      <listitem>Du har mens vid provtagningen</listitem>
    </itemizedlist>
  </section>
  <section>
    <title><emphasis role="information">Ta med legitimation</emphasis></title>
  </section>
  <section>
    <title><emphasis role="collapsible">Därför är du kallad till cellprovtagning</emphasis></title>
    <para>Regelbunden cellprovtagning ger ett starkt skydd mot cancer i livmoderhalsen. Risken minskar med mer än 90 procent.</para>
    <para>Alla med kvinnligt personnummer kallas från 23-64 års ålder.</para>
  </section>
  <section>
    <title><emphasis role="collapsible">Varje provtagning är viktig för din hälsa!</emphasis></title>
    <para>Cellförändringar känns inte. Du bör därför gå på regelbundna kontroller.</para>
    <para>Cellförändringar som kan leda till cancer i livmoderhalsen orsakas oftast av ett virus, HPV (Humant papillom virus).</para>
  </section>
  <section>
    <title><emphasis role="collapsible">Så här går undersökningen till</emphasis></title>
    <para>Du tar av dig på underkroppen. En barnmorska tar ett cellprov från slidan med en liten, mjuk borste. Det tar ofta bara en minut.</para>
  </section>
  <section>
    <para>Vill du veta mer? Besök webbplatsen: <link url="https://www.1177.se/cellprov" type="_blank">1177.se/cellprov</link></para>
  </section>
</article>`;

const referralReceipt = `<?xml version="1.0"?>
<article>
  <section>
    <title>Kontaktorsak</title>
    <para>Ansiktsskada</para>
  </section>
  <section>
    <title>Råd</title>
    <para>Hänvisar till Närakuten och uppmanas ringa tillbaka om fler frågor eller vid försämring. Det går bra att gå till närakuten i morgon bitti.</para>
  </section>
  <section>
    <title>Hänvisning</title>
    <para>Närakut</para>
  </section>
  <section>
    <title>Brådskegrad</title>
    <para>Närmaste dygnet - Bedömning ska ske inom det närmaste dygnet</para>
  </section>
  <section>
    <title>Tidpunkt för råd</title>
    <para>2021-12-10 21:30</para>
  </section>
  <section>
    <title>Hänvisad av</title>
    <para>1177 Vårdguiden på telefon, MedHelp AB</para>
  </section>
  <section>
    <title>Övrigt</title>
    <para>Du kan läsa mer på e-tjänsten <link url="https://journalen.1177.se/" type="_blank">Journalen på 1177.se</link></para>
  </section>
</article>`;

export interface ExampleTemplate {
  id: string;
  name: string;
  description: string;
  xml: string;
}

export const exampleTemplates: ExampleTemplate[] = [
  {
    id: 'booked-no-buttons',
    name: 'Bokad tid (utan knappar)',
    description: 'Bokningsbekräftelse med sektioner och listor',
    xml: bookedAppointmentNoButtons,
  },
  {
    id: 'booked-textboxes',
    name: 'Bokad tid (med informationsrutor)',
    description: 'Bokningsbekräftelse med grå och gul informationsruta',
    xml: bookedAppointmentWithTextBoxes,
  },
  {
    id: 'cervical-screening',
    name: 'Kallelse cellprovtagning',
    description: 'Komplex kallelse med nedfällbara sektioner',
    xml: cervicalScreening,
  },
  {
    id: 'referral-receipt',
    name: 'Hänvisningskvitto',
    description: 'Enkel strukturerad hänvisning med sektioner',
    xml: referralReceipt,
  },
];

export function loadExampleDocument(templateId: string): DocBookDocument | null {
  const template = exampleTemplates.find((t) => t.id === templateId);
  if (!template) return null;
  const doc = parseDocBookXml(template.xml);
  if (!doc) return null;
  return { ...doc, name: template.name };
}

export function createBlankDocument(): DocBookDocument {
  return {
    id: `doc-${Date.now()}`,
    name: 'Nytt meddelande',
    sections: [
      {
        id: `sec-${Date.now()}`,
        title: { children: [{ type: 'text', content: 'Rubrik' }] },
        blocks: [
          {
            id: `para-${Date.now()}`,
            type: 'para',
            children: [{ type: 'text', content: 'Skriv ditt meddelande här.' }],
          },
        ],
      },
    ],
    rootParas: [],
  };
}
