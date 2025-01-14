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

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearch = getService('legacyOpenSearch');
  const opensearchArchiver = getService('opensearchArchiver');

  describe('find', () => {
    describe('with opensearch-dashboards index', () => {
      before(() => opensearchArchiver.load('saved_objects/basic'));
      after(() => opensearchArchiver.unload('saved_objects/basic'));

      it('should return 200 with individual responses', async () =>
        await supertest
          .get('/api/saved_objects/_find?type=visualization&fields=title')
          .expect(200)
          .then((resp) => {
            expect(resp.body).to.eql({
              page: 1,
              per_page: 20,
              total: 1,
              saved_objects: [
                {
                  type: 'visualization',
                  id: 'dd7caf20-9efd-11e7-acb3-3dab96693fab',
                  version: 'WzIsMV0=',
                  attributes: {
                    title: 'Count of requests',
                  },
                  score: 0,
                  migrationVersion: resp.body.saved_objects[0].migrationVersion,
                  namespaces: ['default'],
                  references: [
                    {
                      id: '91200a00-9efd-11e7-acb3-3dab96693fab',
                      name: 'opensearchDashboardsSavedObjectMeta.searchSourceJSON.index',
                      type: 'index-pattern',
                    },
                  ],
                  updated_at: '2017-09-21T18:51:23.794Z',
                },
              ],
            });
            expect(resp.body.saved_objects[0].migrationVersion).to.be.ok();
          }));

      describe('unknown type', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=wigwags')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('page beyond total', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=visualization&page=100&per_page=100')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 100,
                per_page: 100,
                total: 1,
                saved_objects: [],
              });
            }));
      });

      describe('unknown search field', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=url&search_fields=a')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('unknown namespace', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=visualization&namespaces=foo')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('known namespace', () => {
        it('should return 200 with individual responses', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=visualization&fields=title&namespaces=default')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 1,
                saved_objects: [
                  {
                    type: 'visualization',
                    id: 'dd7caf20-9efd-11e7-acb3-3dab96693fab',
                    version: 'WzIsMV0=',
                    attributes: {
                      title: 'Count of requests',
                    },
                    migrationVersion: resp.body.saved_objects[0].migrationVersion,
                    namespaces: ['default'],
                    score: 0,
                    references: [
                      {
                        id: '91200a00-9efd-11e7-acb3-3dab96693fab',
                        name: 'opensearchDashboardsSavedObjectMeta.searchSourceJSON.index',
                        type: 'index-pattern',
                      },
                    ],
                    updated_at: '2017-09-21T18:51:23.794Z',
                  },
                ],
              });
              expect(resp.body.saved_objects[0].migrationVersion).to.be.ok();
            }));
      });

      describe('wildcard namespace', () => {
        it('should return 200 with individual responses from the default namespace', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=visualization&fields=title&namespaces=*')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 1,
                saved_objects: [
                  {
                    type: 'visualization',
                    id: 'dd7caf20-9efd-11e7-acb3-3dab96693fab',
                    version: 'WzIsMV0=',
                    attributes: {
                      title: 'Count of requests',
                    },
                    migrationVersion: resp.body.saved_objects[0].migrationVersion,
                    namespaces: ['default'],
                    score: 0,
                    references: [
                      {
                        id: '91200a00-9efd-11e7-acb3-3dab96693fab',
                        name: 'opensearchDashboardsSavedObjectMeta.searchSourceJSON.index',
                        type: 'index-pattern',
                      },
                    ],
                    updated_at: '2017-09-21T18:51:23.794Z',
                  },
                ],
              });
              expect(resp.body.saved_objects[0].migrationVersion).to.be.ok();
            }));
      });

      describe('with a filter', () => {
        it('should return 200 with a valid response', async () =>
          await supertest
            .get(
              '/api/saved_objects/_find?type=visualization&filter=visualization.attributes.title:"Count of requests"'
            )
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 1,
                saved_objects: [
                  {
                    type: 'visualization',
                    id: 'dd7caf20-9efd-11e7-acb3-3dab96693fab',
                    attributes: {
                      title: 'Count of requests',
                      visState: resp.body.saved_objects[0].attributes.visState,
                      uiStateJSON: '{"spy":{"mode":{"name":null,"fill":false}}}',
                      description: '',
                      version: 1,
                      opensearchDashboardsSavedObjectMeta: {
                        searchSourceJSON:
                          resp.body.saved_objects[0].attributes.opensearchDashboardsSavedObjectMeta
                            .searchSourceJSON,
                      },
                    },
                    namespaces: ['default'],
                    score: 0,
                    references: [
                      {
                        name: 'opensearchDashboardsSavedObjectMeta.searchSourceJSON.index',
                        type: 'index-pattern',
                        id: '91200a00-9efd-11e7-acb3-3dab96693fab',
                      },
                    ],
                    migrationVersion: resp.body.saved_objects[0].migrationVersion,
                    updated_at: '2017-09-21T18:51:23.794Z',
                    version: 'WzIsMV0=',
                  },
                ],
              });
            }));

        it('wrong type should return 400 with Bad Request', async () =>
          await supertest
            .get(
              '/api/saved_objects/_find?type=visualization&filter=dashboard.attributes.title:foo'
            )
            .expect(400)
            .then((resp) => {
              console.log('body', JSON.stringify(resp.body));
              expect(resp.body).to.eql({
                error: 'Bad Request',
                message: 'This type dashboard is not allowed: Bad Request',
                statusCode: 400,
              });
            }));

        it('DQL syntax error should return 400 with Bad Request', async () =>
          await supertest
            .get(
              '/api/saved_objects/_find?type=dashboard&filter=dashboard.attributes.title:foo<invalid'
            )
            .expect(400)
            .then((resp) => {
              console.log('body', JSON.stringify(resp.body));
              expect(resp.body).to.eql({
                error: 'Bad Request',
                message:
                  'DQLSyntaxError: Expected AND, OR, end of input, ' +
                  'whitespace but "<" found.\ndashboard.attributes.title:foo' +
                  '<invalid\n------------------------------^: Bad Request',
                statusCode: 400,
              });
            }));
      });
    });

    describe('searching for special characters', () => {
      before(() => opensearchArchiver.load('saved_objects/find_edgecases'));
      after(() => opensearchArchiver.unload('saved_objects/find_edgecases'));

      it('can search for objects with dashes', async () =>
        await supertest
          .get('/api/saved_objects/_find')
          .query({
            type: 'visualization',
            search_fields: 'title',
            search: 'my-vis*',
          })
          .expect(200)
          .then((resp) => {
            const savedObjects = resp.body.saved_objects;
            expect(savedObjects.map((so) => so.attributes.title)).to.eql(['my-visualization']);
          }));

      it('can search with the prefix search character just after a special one', async () =>
        await supertest
          .get('/api/saved_objects/_find')
          .query({
            type: 'visualization',
            search_fields: 'title',
            search: 'my-*',
          })
          .expect(200)
          .then((resp) => {
            const savedObjects = resp.body.saved_objects;
            expect(savedObjects.map((so) => so.attributes.title)).to.eql(['my-visualization']);
          }));

      it('can search for objects with asterisk', async () =>
        await supertest
          .get('/api/saved_objects/_find')
          .query({
            type: 'visualization',
            search_fields: 'title',
            search: 'some*vi*',
          })
          .expect(200)
          .then((resp) => {
            const savedObjects = resp.body.saved_objects;
            expect(savedObjects.map((so) => so.attributes.title)).to.eql(['some*visualization']);
          }));

      it('can still search tokens by prefix', async () =>
        await supertest
          .get('/api/saved_objects/_find')
          .query({
            type: 'visualization',
            search_fields: 'title',
            search: 'visuali*',
          })
          .expect(200)
          .then((resp) => {
            const savedObjects = resp.body.saved_objects;
            expect(savedObjects.map((so) => so.attributes.title)).to.eql([
              'my-visualization',
              'some*visualization',
            ]);
          }));
    });

    describe('without opensearch-dashboards index', () => {
      before(
        async () =>
          // just in case the opensearch-dashboards server has recreated it
          await opensearch.indices.delete({
            index: '.opensearch_dashboards',
            ignore: [404],
          })
      );

      it('should return 200 with empty response', async () =>
        await supertest
          .get('/api/saved_objects/_find?type=visualization')
          .expect(200)
          .then((resp) => {
            expect(resp.body).to.eql({
              page: 1,
              per_page: 20,
              total: 0,
              saved_objects: [],
            });
          }));

      describe('unknown type', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=wigwags')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('missing type', () => {
        it('should return 400', async () =>
          await supertest
            .get('/api/saved_objects/_find')
            .expect(400)
            .then((resp) => {
              expect(resp.body).to.eql({
                error: 'Bad Request',
                message:
                  '[request query.type]: expected at least one defined value but got [undefined]',
                statusCode: 400,
              });
            }));
      });

      describe('page beyond total', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=visualization&page=100&per_page=100')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 100,
                per_page: 100,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('unknown search field', () => {
        it('should return 200 with empty response', async () =>
          await supertest
            .get('/api/saved_objects/_find?type=url&search_fields=a')
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));
      });

      describe('with a filter', () => {
        it('should return 200 with an empty response', async () =>
          await supertest
            .get(
              '/api/saved_objects/_find?type=visualization&filter=visualization.attributes.title:"Count of requests"'
            )
            .expect(200)
            .then((resp) => {
              expect(resp.body).to.eql({
                page: 1,
                per_page: 20,
                total: 0,
                saved_objects: [],
              });
            }));

        it('wrong type should return 400 with Bad Request', async () =>
          await supertest
            .get(
              '/api/saved_objects/_find?type=visualization&filter=dashboard.attributes.title:foo'
            )
            .expect(400)
            .then((resp) => {
              console.log('body', JSON.stringify(resp.body));
              expect(resp.body).to.eql({
                error: 'Bad Request',
                message: 'This type dashboard is not allowed: Bad Request',
                statusCode: 400,
              });
            }));
      });
    });
  });
}
