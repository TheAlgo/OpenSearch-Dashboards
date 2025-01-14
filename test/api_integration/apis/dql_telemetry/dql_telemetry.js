/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import expect from '@osd/expect';
import Bluebird from 'bluebird';
import { get } from 'lodash';

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearchArchiver = getService('opensearchArchiver');
  const opensearch = getService('legacyOpenSearch');

  describe('telemetry API', () => {
    before(() => opensearchArchiver.load('saved_objects/basic'));
    after(() => opensearchArchiver.unload('saved_objects/basic'));

    it('should increment the opt *in* counter in the .opensearch_dashboards/dql-telemetry document', async () => {
      await supertest
        .post('/api/opensearch-dashboards/dql_opt_in_stats')
        .set('content-type', 'application/json')
        .send({ opt_in: true })
        .expect(200);

      return opensearch
        .search({
          index: '.opensearch_dashboards',
          q: 'type:dql-telemetry',
        })
        .then((response) => {
          const dqlTelemetryDoc = get(response, 'hits.hits[0]._source.dql-telemetry');
          expect(dqlTelemetryDoc.optInCount).to.be(1);
        });
    });

    it('should increment the opt *out* counter in the .opensearch_dashboards/dql-telemetry document', async () => {
      await supertest
        .post('/api/opensearch-dashboards/dql_opt_in_stats')
        .set('content-type', 'application/json')
        .send({ opt_in: false })
        .expect(200);

      return opensearch
        .search({
          index: '.opensearch_dashboards',
          q: 'type:dql-telemetry',
        })
        .then((response) => {
          const dqlTelemetryDoc = get(response, 'hits.hits[0]._source.dql-telemetry');
          expect(dqlTelemetryDoc.optOutCount).to.be(1);
        });
    });

    it('should report success when opt *in* is incremented successfully', () => {
      return supertest
        .post('/api/opensearch-dashboards/dql_opt_in_stats')
        .set('content-type', 'application/json')
        .send({ opt_in: true })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body.success).to.be(true);
        });
    });

    it('should report success when opt *out* is incremented successfully', () => {
      return supertest
        .post('/api/opensearch-dashboards/dql_opt_in_stats')
        .set('content-type', 'application/json')
        .send({ opt_in: false })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body.success).to.be(true);
        });
    });

    it('should only accept literal boolean values for the opt_in POST body param', function () {
      return Bluebird.all([
        supertest
          .post('/api/opensearch-dashboards/dql_opt_in_stats')
          .set('content-type', 'application/json')
          .send({ opt_in: 'notabool' })
          .expect(400),
        supertest
          .post('/api/opensearch-dashboards/dql_opt_in_stats')
          .set('content-type', 'application/json')
          .send({ opt_in: 0 })
          .expect(400),
        supertest
          .post('/api/opensearch-dashboards/dql_opt_in_stats')
          .set('content-type', 'application/json')
          .send({ opt_in: null })
          .expect(400),
        supertest
          .post('/api/opensearch-dashboards/dql_opt_in_stats')
          .set('content-type', 'application/json')
          .send({ opt_in: undefined })
          .expect(400),
        supertest
          .post('/api/opensearch-dashboards/dql_opt_in_stats')
          .set('content-type', 'application/json')
          .send({})
          .expect(400),
      ]);
    });
  });
}
