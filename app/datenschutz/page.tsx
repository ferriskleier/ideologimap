export default function Datenschutz() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
          <div className="space-y-2">
            <p><strong>Allgemeine Hinweise</strong></p>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Allgemeine Hinweise und Pflichtinformationen</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Datenschutz</h3>
              <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
            </div>

            <div>
              <h3 className="font-semibold">Hinweis zur verantwortlichen Stelle</h3>
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <p className="mt-2">
                Ferris Kleier<br />
                E-Mail: ferris@uldagon.com
              </p>
              <p className="mt-2">Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.</p>
            </div>

            <div>
              <h3 className="font-semibold">Speicherdauer</h3>
              <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.</p>
            </div>

            <div>
              <h3 className="font-semibold">Gesetzlich vorgeschriebener Datenschutzbeauftragter</h3>
              <p>Wir haben keinen Datenschutzbeauftragten bestellt, da dies für unsere Website gesetzlich nicht erforderlich ist.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf dieser Website</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Server-Log-Dateien</h3>
              <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="mt-2">Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
            </div>

            <div>
              <h3 className="font-semibold">Daten, die Sie eingeben</h3>
              <p>Diese Website speichert ausschließlich die folgenden Daten, die Sie aktiv eingeben:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Namen von Personen, die Sie in das Eingabefeld eingeben</li>
                <li>Position auf der politischen Karte (X- und Y-Koordinaten)</li>
                <li>Optional: Wikipedia-URL</li>
                <li>Zeitstempel der Eingabe</li>
              </ul>
              <p className="mt-2">Diese Daten werden lokal in einer SQLite-Datenbank gespeichert und dienen ausschließlich zur Darstellung der Personen auf der politischen Karte. Es werden keine weiteren personenbezogenen Daten von Ihnen erfasst oder gespeichert.</p>
              <p className="mt-2">Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse folgt aus dem Zweck, eine interaktive politische Karte zur Verfügung zu stellen.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Ihre Rechte</h2>
          
          <div className="space-y-4">
            <p>Sie haben folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
            <ul className="list-disc ml-6">
              <li>Recht auf Auskunft</li>
              <li>Recht auf Berichtigung oder Löschung</li>
              <li>Recht auf Einschränkung der Verarbeitung</li>
              <li>Recht auf Widerspruch gegen die Verarbeitung</li>
              <li>Recht auf Datenübertragbarkeit</li>
            </ul>
            <p className="mt-2">Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Widerspruch gegen Werbe-E-Mails</h2>
          <p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.</p>
        </section>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600">Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">← Zurück zur Startseite</a>
      </div>
    </div>
  );
}